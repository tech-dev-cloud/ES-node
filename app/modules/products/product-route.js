const controller = require('./product-controller');
const Joi = require('Joi');
const { PRODUCTS_TYPE } = require('../../utils/constants');
module.exports = [
  {
    path: '/products',
    method: 'GET',
    JoiSchemaForSwagger: {
      query: Joi.object({
        searchString: Joi.string(),
        searchKey: Joi.string(),
        limit: Joi.number().default(20),
        index: Joi.number().min(0),
        enrolled: Joi.boolean(),
        product_ids: Joi.string(),
        type: Joi.string().valid(PRODUCTS_TYPE),
      }),
      group: 'Products',
      description: 'Api to get products',
      model: 'GetProducts',
    },
    version: 'v1',
    handler: controller.getProducts,
  },
];
