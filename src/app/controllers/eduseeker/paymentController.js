const { PRODUCT_TYPE, PAYMENT_PURPOSE, ERROR_TYPE } = require('../../utils/constants');
const MESSAGES = require('../../utils/messages');
const { userService, quizService, paymentService } = require('../../services');
const {PaymentModel, Product, Order}=require('../../models');
const responseHelper = require('../../utils/responseHelper');
const common=require('../../utils/common');
const order = require('../../models/order');

const controller = {}

controller.createPayment = async (payload) => {
  let user, product={};
  try {
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
        const alreadyEnrolled=await PaymentModel.findOne({userId: payload.user.userId, productId:payload.productId}).lean();
        if(alreadyEnrolled){
          throw responseHelper.createErrorResponse(ERROR_TYPE.ALREADY_EXISTS, MESSAGES.QUIZ.DUPLICATE);
        }
        product = await quizService.getQuiz({ _id: payload.productId });
        paymentObject.amount = product.amount;
        paymentObject.purpose = PAYMENT_PURPOSE.Quiz
        break;
    }
    if(!product.isPaid){
        const data=await paymentService.freeEnrolled(payload, product);
        return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data)
    }
    paymentObject.webhook = "https://api.eduseeker.in/api/payment/webhook";
    paymentObject.redirect_url="https://eduseeker.in/order-confirm"
    const data = await paymentService.createPayment(paymentObject, payload);
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data);
  } catch (err) {
    throw err;
  }

}

controller.createOrder = async (request, response) => {
  let user, product={};
  try {
    //Add user details
    let paymentObject = {
      buyer_name: request.user.name,
      email: request.user.email,
      phone: request.user.phoneNumber
    }
    let purchased=await Order.findOne({user_id:request.user._id,product_id:request.body.productId,validity:{$gte:new Date()}}).lean();
    if(!purchased){
      let product=await common.getProduct(request.body.productId);
      paymentObject.amount = product.price;
      paymentObject.purpose= "Educational Purchase";
      if(!product.isPaid){
        const data=await paymentService.freeEnrolled(request.user, product);
        response.status(200).json({
          success:true,
          message:MESSAGES.PAYMENT.SUCCESS
        })
        return;
      }
      paymentObject.webhook = "https://api.eduseeker.in/api/payment/webhook";
      paymentObject.redirect_url="http://eduseeker.in/order-confirm";
      const data = await paymentService.createPayment(paymentObject, payload);
      response.status(200).json({
        success:true,
        message:MESSAGES.PAYMENT.SUCCESS,
        data
      })
      return
    }
    // if(alreadyEnrolled){
    //   throw responseHelper.createErrorResponse(ERROR_TYPE.ALREADY_EXISTS, MESSAGES.QUIZ.DUPLICATE);
    // }
    // switch (payload.productType) {
    //   case PRODUCT_TYPE.QUIZ:
    //     const alreadyEnrolled=await PaymentModel.findOne({userId: payload.user.userId, productId:payload.productId}).lean();
    //     product = await quizService.getQuiz({ _id: payload.productId });
    //     paymentObject.amount = product.amount;
    //     paymentObject.purpose = PAYMENT_PURPOSE.Quiz
    //     break;
    // }
    // if(!product.isPaid){
    //     const data=await paymentService.freeEnrolled(payload, product);
    //     return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data)
    // }
    // paymentObject.webhook = "https://api.eduseeker.in/api/payment/webhook";
    // paymentObject.redirect_url="https://eduseeker.in/order-confirm"
    // const data = await paymentService.createPayment(paymentObject, payload);
    // return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data);
  } catch (err) {
    throw err;
  }

}

controller.webhook = async (payload) => {
  console.log('webhook call====>>>>');
  const data = await paymentService.webhook(payload);
  return;
}

module.exports = { paymentController: controller };