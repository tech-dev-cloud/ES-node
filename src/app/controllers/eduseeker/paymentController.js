const InstaMojo = require('instamojo-nodejs');

const { PRODUCT_TYPE, PAYMENT_PURPOSE } = require('../../utils/constants');
const paymentGateway = require('../../../config/config')[process.env.ACTIVE_MODE || 'Development'].PAYMENT_GATEWAY;
const MESSAGES = require('../../utils/messages');
const { userService, quizService, paymentService } = require('../../services');
const responseHelper = require('../../utils/responseHelper');

const controller = {}

controller.createPayment = async (payload) => {

  InstaMojo.setKeys(paymentGateway.API_KEY, paymentGateway.TOKEN);
  InstaMojo.isSandboxMode(true);
  let paymentObject = new InstaMojo.PaymentData();

  let user, product;
  try {
    //Add user details
    user = await userService.getUser({ _id: payload.user.userId });
    paymentObject = {
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

    // Add URLs
    // paymentObject.redirect_url = `http://35.208.23.170:4200/order-confirm/${product._id}`;
    paymentObject.webhook = "https://api.eduseeker.in/api/payment/webhook";
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