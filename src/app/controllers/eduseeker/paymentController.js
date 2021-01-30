var CryptoJS = require("crypto-js");
const MESSAGES = require('../../utils/messages');
const { paymentService } = require('../../services');
const { Order } = require('../../models');
const config = require('../../../config/config');
let params=require(`../../../config/env/${config.NODE_ENV}_params.json`);
const common = require('../../utils/common');

const controller = {}

controller.createOrder = async (request, response) => {
  //Add user details
  let paymentObject = {
    buyer_name: request.user.name,
    email: request.user.email,
    phone: request.user.phoneNumber
  }
  let purchased = await Order.findOne({ user_id: request.user._id, product_id: request.body.productId, order_status:{$in:['Free', 'Credit']}, validity: { $gte: new Date() } }).lean();
  if (!purchased) {
    let product = await common.getProduct(request.body.productId);
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
}

controller.webhook = async (request, response) => {
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
          return {
            user_id:order.user_id,
            parent_product_id:order._id,
            product_id:id,
            product_type:obj.type,
            product_name:obj.name,
            product_image:product.image.map(obj=>obj.image_path),
            order_status:payload.status,
            validity
          }
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
}

module.exports = { paymentController: controller }
