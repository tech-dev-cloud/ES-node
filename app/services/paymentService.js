const InstaMojo = require('instamojo-nodejs');
const config = require('../../config/config');
const { Order } = require('../models');


let service = {};

service.createPayment = async (paymentObject, product, user) => {
  if(config.NODE_ENV=='development'){
    InstaMojo.isSandboxMode(true);
  }
  InstaMojo.setKeys(config.PRIVATE_API_KEY, config.PRIVATE_AUTH_TOKEN);
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
          product_name:product.name,
          product_image: product.image,
          user_id: user._id,
          final_price:paymentObject.amount,
          instructor_id:product.created_by
        }
        if(product.validity){
          validity = new Date();
          validity = new Date(validity.setMonth(validity.getMonth() + product.validity));
          payload['validity']=validity;
        }
        let payment = new Order(payload);
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
  let payload = {
    user_id: user._id,
    product_id: product._id,
    product_type: product.type,
    product_name: product.name,
    product_image: product.image.map(obj => obj.image_path),
    final_price: product.price,
    order_status: 'Free'
  }
  let order = new Order(payload);
  await order.save(payload);
  return;
}


module.exports = { paymentService: service };
