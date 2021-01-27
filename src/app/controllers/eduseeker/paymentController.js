var CryptoJS = require("crypto-js");
const { PRODUCT_TYPE, PAYMENT_PURPOSE, ERROR_TYPE } = require('../../utils/constants');
const MESSAGES = require('../../utils/messages');
const { userService, quizService, paymentService } = require('../../services');
const { PaymentModel, Order } = require('../../models');
const paymentGateway = require('../../../config/config');
const responseHelper = require('../../utils/responseHelper');
const common = require('../../utils/common');

const controller = {}

controller.createPayment = async (payload) => {
  let user, product = {};
  //Add user details
  user = await userService.getUser({ _id: payload.user.userId });
  let paymentObject = {
    buyer_name: user.name,
    email: user.email,
    phone: user.phoneNumber
  }
  // Add Product details
  switch (payload.productType) {
    case PRODUCT_TYPE.QUIZ:
      const alreadyEnrolled = await PaymentModel.findOne({ userId: payload.user.userId, productId: payload.productId }).lean();
      if (alreadyEnrolled) {
        throw responseHelper.createErrorResponse(ERROR_TYPE.ALREADY_EXISTS, MESSAGES.QUIZ.DUPLICATE);
      }
      product = await quizService.getQuiz({ _id: payload.productId });
      paymentObject.amount = product.amount;
      paymentObject.purpose = PAYMENT_PURPOSE.Quiz
      break;
  }
  if (!product.isPaid) {
    const data = await paymentService.freeEnrolled(payload, product);
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data)
  }
  paymentObject.webhook = "http://devapi.eduseeker.in/api/payment/webhook";
  paymentObject.redirect_url = "https://devweb.eduseeker.in/order-confirm"
  const data = await paymentService.createPayment(paymentObject, payload);
  return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data);
}

controller.createOrder = async (request, response) => {
  //Add user details
  let paymentObject = {
    buyer_name: request.user.name,
    email: request.user.email,
    phone: request.user.phoneNumber
  }
  let purchased = await Order.findOne({ user_id: request.user._id, product_id: request.body.productId, validity: { $gte: new Date() } }).lean();
  if (!purchased) {
    let product = await common.getProduct(request.body.productId);
    paymentObject.amount = product.price;
    paymentObject.purpose = product.name;
    if (!product.isPaid) {
      await paymentService.freeEnrolled(request.user, product);
      response.status(200).json({
        success: true,
        message: MESSAGES.PAYMENT.SUCCESS
      })
      return;
    }
    paymentObject.webhook = "https://api.eduseeker.in/api/payment/webhook";
    paymentObject.redirect_url = "https://eduseeker.in/order-confirm";
    const data = await paymentService.createPayment(paymentObject, product, request.user);
    response.status(200).json({
      success: true,
      message: MESSAGES.PAYMENT.SUCCESS,
      data
    })
    return;
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
    let calculatedMac = CryptoJS.HmacSHA1(data, paymentGateway.SALT);
    order.status = payload.status;
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
        order.save();
    } else {
      order.status = 'Failed';
      order.save();
    }
  }
  response.status(200).json({
    success:true,
    message:"webhook executed successfully"
  })
  }
}

module.exports = { paymentController: controller }
