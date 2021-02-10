
const JOI = require('joi');
const { USER_ROLE } = require('../../../utils/constants');
const { paymentController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

let MODULE = {
  name: 'payment',
  group: 'Payment'
}

const routes = [
  {
    path: `/api/${MODULE.name}`,
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        productId: routeUtils.validation.mongooseId,
        // productType: JOI.string().valid(Object.values(PRODUCT_TYPE)).required()
      },
      group: MODULE.group,
      description: 'Api to create Payment request',
      model: 'CreatePayment'
    },
    auth: [USER_ROLE.STUDENT],
    handler: paymentController.createPayment
  },
  {
    path: `/api/createOrder`,
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        productId: routeUtils.validation.mongooseId,
      },
      group: MODULE.group,
      description: 'Api to create Payment request',
      model: 'CreatePayment'
    },
    auth: [USER_ROLE.STUDENT],
    handler: paymentController.createOrder
  },
  {
    path: `/api/${MODULE.name}/webhook`,
    method: 'POST',
    joiSchemaForSwagger: {
      formData: {
        amount: JOI.number(),
        buyer: JOI.string().email(),
        buyer_name: JOI.string(),
        buyer_phone: JOI.string(),
        currency: JOI.string(),
        fees: JOI.string(),
        longurl: JOI.string(),
        mac: JOI.string(),
        payment_id: JOI.string(),
        payment_request_id: JOI.string(),
        purpose: JOI.string(),
        shorturl: JOI.string(),
        status: JOI.string()
      },
      group: MODULE.group,
      description: 'webhook',
      model: 'PaymentSuccess'
    },
    // auth: [USER_ROLE.STUDENT],
    handler: paymentController.webhook
  },
  {
    path: `/api/orders`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      queery:{
        order_status:JOI.string(),
        createdAt:JOI.string(),
        skip:JOI.number(),
        limit:JOI.number()
      },
      group: MODULE.group,
      description: 'Get Orders',
      model: 'PaymentSuccess'
    },
    auth: [USER_ROLE.TEACHER,USER_ROLE.ADMIN],
    handler: paymentController.getOrders
  }
]

module.exports = routes;