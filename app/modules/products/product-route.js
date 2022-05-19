const controller = require('./product-controller');
const Joi = require('joi');
const { PRODUCT_TYPE } = require('../../utils/server-constant');
module.exports = [
  {
    path: '/products',
    method: 'GET',
    joiSchemaForSwagger: {
      query: Joi.object({
        searchString: JOI.string(),
        searchKey: JOI.string(),
        limit: JOI.number().default(20),
        index: JOI.number().min(0),
        enrolled: JOI.boolean(),
        product_ids: JOI.string(),
        type: JOI.string().valid(PRODUCTS_TYPE),
      }),
      group: 'Products',
      description: 'Api to get products',
      model: 'GetProducts',
    },
    version: 'v1',
    handler: controller.getProducts,
  },
];
