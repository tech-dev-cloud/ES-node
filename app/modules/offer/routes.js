'use strict';

const Joi = require('joi');
const { USER_ROLE, DB, PRODUCTS_TYPE } = require('../../utils/constants');
const routeUtils = require('../../utils/routeUtils');
const offer = require('./controller');

const routes = [
  {
    method: 'POST',
    path: '/api/offer',
    joiSchemaForSwagger: {
      headers: Joi.object({
        // authorization: Joi.string().required(),
      }).unknown(),
      body: {
        name: Joi.string().required(),
        description: Joi.string(),
        category_id: routeUtils.validation.mongooseId,
        type: Joi.string().valid(Object.values(DB.OFFER_TYPES)),
        value: Joi.number(),
        value_json: Joi.object({
          percentage: Joi.number(),
          action: Joi.string().valid(Object.values(DB.PRODUCT_PRICE_TYPE)),
        }),
        max_discount_price: Joi.number(),
        validity_type: Joi.string().valid(Object.values(DB.OFFER_VALIDITY)),
        validity: Joi.number(),
        product_category: Joi.string().valid(Object.values(PRODUCTS_TYPE)),
        productIds: Joi.array().items(routeUtils.validation.mongooseId),
      },
      group: 'Offers',
      description: 'Api to add new offer',
      model: 'CreateOffer',
    },
    auth: [USER_ROLE.ADMIN],
    handler: offer.addNewOffer,
  },
  {
    method: 'PUT',
    path: '/api/category/:offerId',
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
      params: {
        offerId: routeUtils.validation.mongooseId,
      },
      body: {
        name: Joi.string(),
        description: Joi.string(),
        category_id: routeUtils.validation.mongooseId,
        type: Joi.string().valid(Object.values(DB.OFFER_TYPES)),
        value: Joi.number(),
        value_json: Joi.object({
          percentage: Joi.number(),
          action: Joi.string().valid(Object.values(DB.PRODUCT_PRICE_TYPE)),
        }),
        max_discount_price: Joi.number(),
        validity: Joi.number(),
        product_category: Joi.string().valid(Object.values(PRODUCTS_TYPE)),
        productIds: Joi.array().items(routeUtils.validation.mongooseId),
        removeProductIds: Joi.array().items(routeUtils.validation.mongooseId),
      },
      group: 'Offers',
      description: 'Api to update offer',
      model: 'UpdateOffer',
    },
    auth: [USER_ROLE.ADMIN],
    handler: offer.updateOffer,
  },
];
module.exports = routes;
