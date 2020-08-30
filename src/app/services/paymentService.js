const InstaMojo = require('instamojo-nodejs');
var CryptoJS = require("crypto-js");

const paymentGateway = require('../../config/config')[process.env.ACTIVE_MODE || 'Development'].PAYMENT_GATEWAY;
const { PaymentModel } = require('../models');
const { ERROR_TYPE } = require('../utils/constants');
const responseHelper = require('../utils/responseHelper');


let service = {};

service.createPayment = async (paymentObject, payload) => {
  // InstaMojo.setKeys(paymentGateway.API_KEY, paymentGateway.TOKEN);
  InstaMojo.setKeys(process.env.PRIVATE_API_KEY, process.env.PRIVATE_AUTH_TOKEN);
  InstaMojo.isSandboxMode(false);
  return new Promise((resolve, reject) => {
    InstaMojo.createPayment(paymentObject, async (err, res) => {
      if (!err) {
        console.log(res);
        const response = JSON.parse(res);
        let payment = new PaymentModel({
          ...response,
          payment_request_id: response.payment_request.id,
          productType: payload.productType,
          productId: payload.productId,
          userId: payload.user.userId
        });
        const data = await payment.save();
        resolve({ url: response.payment_request.longurl });
      }
      else {
        reject(err);
      }
    });
  })
}


// Payment webhook handler
service.webhook = async (payload) => {
  const payment = await PaymentModel.findOne({ payment_request_id: payload.payment_request_id });
  if (payment) {
    console.log('===>>payment object found');
    let providedMac = payload.mac;
    delete payload.mac;
    delete payload.user;
    delete payload.file;
    const data = Object.keys(payload).sort().map(key => payload[key]).join('|');
    let calculatedMac = CryptoJS.HmacSHA1(data, paymentGateway.SALT);
    payment.status = payload.status;
    payment.save();
    if (providedMac == calculatedMac.toString()) {
      return true;
    } else {
      payment.status = 'Failed';
      payment.save();
      throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST)
    }
  }
  console.log('===>>>payment object not found');
  throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST)
}

module.exports = { paymentService: service };