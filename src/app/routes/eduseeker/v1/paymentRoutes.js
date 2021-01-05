
const JOI = require('joi');
const { USER_ROLE, DEFAULT, PRODUCT_TYPE } = require('../../../utils/constants');
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
        productType: JOI.string().valid(Object.values(PRODUCT_TYPE)).required()
      },
      group: MODULE.group,
      description: 'Api to create Payment request',
      model: 'CreatePayment'
    },
    auth: [USER_ROLE.STUDENT],
    handler: paymentController.createPayment
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
    path: `/admin/${MODULE.name}`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      query: {
        payment_status: JOI.string()
      },
      group: MODULE.group,
      description: 'Get All Payments',
      model: 'GetAllPayments'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: paymentController.getAllPayments
  },
  {
    path: `/admin/${MODULE.name}`,
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        email:JOI.string().email().required(),
        product_ids:JOI.array().items(routeUtils.validation.mongooseId).required(),
        grand_total:JOI.number().required(),
        status: JOI.string().valid(['Pending','Credit']).required(),
      },
      group: MODULE.group,
      description: 'Add Payments from admin',
      model: 'AddPayment'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: paymentController.addPayment
  },
  {
    path: `/admin/${MODULE.name}/:id`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params:{
        id:routeUtils.validation.mongooseId
      },
      body: {
        email:JOI.string().email(),
        grand_total:JOI.number(),
        status: JOI.string().valid(['Pending','Credit'])
      },
      group: MODULE.group,
      description: 'Update Payments from admin',
      model: 'UpdatePayment'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: paymentController.updatePayment
  },
  {
    path: `/admin/${MODULE.name}/:id`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params:{
        id:routeUtils.validation.mongooseId
      },
      group: MODULE.group,
      description: 'Get Payments from admin',
      model: 'GetPaymentById'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: paymentController.getPaymentByID
  }
]

module.exports = routes;