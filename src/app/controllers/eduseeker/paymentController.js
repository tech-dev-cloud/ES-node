var CryptoJS = require("crypto-js");
const MESSAGES = require('../../utils/messages');
const { paymentService } = require('../../services');
const { Order } = require('../../models');
const config = require('../../../config/config');
let params=require(`../../../config/env/${config.NODE_ENV}_params.json`);
const common = require('../../utils/common');

const controller = {
  createOrder: async (request, response) => {
    //Add user details
    let paymentObject = {
      buyer_name: request.user.name,
      email: request.user.email,
      phone: request.user.phoneNumber
    }
    let product = await common.getProduct(request.body.productId);
    let criteria={ user_id: request.user._id, product_id: request.body.productId, order_status:{$in:['Free', 'Credit']} };
    if(product.validity){
      criteria['validity']={ $gte: new Date() };
    }
    let purchased = await Order.findOne(criteria).lean();
    if (!purchased) {
      paymentObject.amount = product.price;
      paymentObject.purpose = product.name;
      if (!product.isPaid) {
        await paymentService.freeEnrolled(request.user, product);
        return response.status(200).json({
          success: true,
          message: MESSAGES.PAYMENT.SUCCESS
        })
      }
      paymentObject.webhook = params.backend_server+params.payment_webhook;
      paymentObject.redirect_url = params.frontend_server+params.payment_redirection;
      const data = await paymentService.createPayment(paymentObject, product, request.user);
      return response.status(200).json({
        success: true,
        message: MESSAGES.PAYMENT.SUCCESS,
        data
      })
    }
    response.status(400).json({
      success: true,
      message: 'Already purchased'
    })
  },
  webhook: async (request, response) => {
    let payload=request.body;
    const order = await Order.findOne({ payment_request_id: payload.payment_request_id });
    if (order) {
      let providedMac = payload.mac;
      delete payload.mac;
      delete payload.user;
      delete payload.file;
      delete payload.web_app;

      const data = Object.keys(payload).sort().map(key => payload[key]).join('|');
      let calculatedMac = CryptoJS.HmacSHA1(data, config.PRIVATE_SALT);

      order.order_status = payload.status;
      if (providedMac == calculatedMac.toString()) {
        let product=await common.getProduct(order.product_id);
        if(product.type==3){
          let validity = new Date();
          validity = new Date(validity.setMonth(validity.getMonth() + product.validity));
          let sub_products=await Promise.all(product.sub_products.map(async(id)=>{
            let obj=await common.getProduct(id);
            let subproduct_order={
              user_id:order.user_id,
              parent_product_id:order._id,
              product_id:id,
              product_type:obj.type,
              product_name:obj.name,
              product_image:product.image.map(obj=>obj.image_path),
              order_status:payload.status
            }
            if(product.validity){
              subproduct_order['validity']=validity;
            }
            return subproduct_order;
          }));
          Order.insertMany(sub_products);
        }
        order.save();
      } else {
        order.order_status = 'Failed';
        order.save();
      }
    }
    response.status(200).json({
      success:true,
      message:"webhook executed successfully"
    })
  },
  getOrders: async (request, response)=>{
    let $addFields={};
    let match={instructor_id:request.user._id};
    if(request.query.order_status){
      match['order_status']=request.query.order_status;
    }
    if(request.query.createdAt){          
      $addFields["creationDate"] = {$dateToString: {format: "%Y-%m-%d", date: "$createdAt", timezone: "+0530"}};
      match["creationDate"] = request.query.createdAt;
    }
    let query=[];
    if(Object.keys($addFields).length){
      query[0] = {$addFields};
    }
    query=[
      ...query,
      {$match:match},
      {$lookup:{localField:"user_id",foreignField:"_id", from:"users", as:"userData"}},
      {$unwind:"$userData"},
      {$project:{product_name:1, product_image:1, final_price:1,order_status:1, validity:1, payment_request_id:1,user_id:1,"userData.name":1,"userData.email":1, createdAt:1}},
      {$sort:{_id:-1}}
    ]
    let allOrdersQuery= Order.aggregate(query);
    let totalAmount=Order.aggregate([
      {$match: match},
      {$group:{_id:null, totoalCounts:{$sum:1},amount:{$sum:"$final_price"}}}
    ])
    Promise.all([allOrdersQuery,totalAmount]).then(result=>{
      response.status(200).json({
        success:true,
        data:{orders:result[0],stats:result[1]}
      })
    }).catch(err=>{
      response.status(500).json({
        success:false,
        message:'something went wrong',
        err
      })
    })
  }
}

module.exports = { paymentController: controller }
