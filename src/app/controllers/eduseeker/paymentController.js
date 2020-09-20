const { PRODUCT_TYPE, PAYMENT_PURPOSE, ERROR_TYPE } = require('../../utils/constants');
const MESSAGES = require('../../utils/messages');
const { userService, quizService, paymentService } = require('../../services');
const responseHelper = require('../../utils/responseHelper');

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
    paymentObject.redirect_url="https://www.eduseeker.in/order-confirm"
    const data = await paymentService.createPayment(paymentObject, payload);
    return responseHelper.createSuccessResponse(MESSAGES.PAYMENT.SUCCESS, data);
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