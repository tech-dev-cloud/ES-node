const InstaMojo = require('instamojo-nodejs');
var CryptoJS = require("crypto-js");
// const paymentGateway = require('../../config/config')[process.env.ACTIVE_MODE || 'Development'].PAYMENT_GATEWAY;
const paymentGateway = require('../../config/config');
const { Order } = require('../models');


let service = {};

service.createPayment = async (paymentObject, product, user) => {
  // InstaMojo.setKeys(paymentGateway.API_KEY, paymentGateway.TOKEN);
  InstaMojo.setKeys(process.env.PRIVATE_API_KEY, process.env.PRIVATE_AUTH_TOKEN);
  InstaMojo.isSandboxMode(true);
  return new Promise((resolve, reject) => {
    InstaMojo.createPayment(paymentObject, async (err, res) => {
      if (!err) {
        let validity;
        const response = JSON.parse(res);
        let payload={
          ...response,
          payment_request_id: response.payment_request.id,
          product_type: product.type,
          product_id: product._id,
          user_id: user._id
        }
        if(product.validity){
          validity = new Date();
          validity = new Date(validity.setMonth(validity.getMonth() + product.validity));
          payload['validity']=validity;
        }
        let payment = new Order();
        await payment.save();
        resolve({ url: response.payment_request.longurl });
      }
      else {
        reject(err);
      }
    });
  })
}

service.freeEnrolled = async (user, product) => {
  let validity = new Date();
  validity = new Date(validity.setMonth(validity.getMonth() + product.validity));
  let payload = {
    user_id: user._id,
    product_id: product._id,
    product_type: product.type,
    product_name: product.name,
    product_image: product.image.map(obj => obj.image_path),
    final_price: product.price,
    order_status: 'Free',
    validity
  }
  let order = new Order(payload);
  await order.save(payload);
  return;
}
service.webhook = async (payload) => {
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
      order.save();
    } else {
      order.status = 'Failed';
      order.save();
    }
  }
  return;
}

module.exports = { paymentService: service };
