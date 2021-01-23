
const JOI = require('joi');
const { USER_ROLE, PRODUCT_TYPE } = require('../../../utils/constants');
const { productController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

let MODULE = {
  group: 'Product'
}
const routes = [
  {
    path: `/api/product`,
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        name: JOI.string().required(),
        heading: JOI.string(),
        strikeprice: JOI.number().required(),
        price: JOI.number(),
        isPaid: JOI.boolean().required(),
        similar_products: JOI.array().items(routeUtils.validation.mongooseId),
        description: JOI.string(),
        type: JOI.string().valid(['1', '2', '3', '4']).description("1->PDF, 2->quiz, 3->books, 4-> course"),
        priority: JOI.number().default(0),
        product_meta: JOI.object(),
        status: JOI.boolean(),
        benefits: JOI.array().items(JOI.string()),
        image: JOI.object({
          type: JOI.string().valid(['1', '2', '3']).description("1->PDF, 2->quiz, 3->books, 4-> course"),
          image_path: JOI.string(),
          priority: JOI.number().default(1)
        }),
        product_map_data: JOI.array().items(JOI.any())
      },
      group: `${MODULE.group}`,
      description: 'Api to create Product',
      model: 'CreateProduct'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: productController.createProduct
  },
  {
    path: `/admin/getAllProducts`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      query: {
        searchString: JOI.string(),
        searchKey: JOI.string(),
        limit: JOI.number().default(20),
        index: JOI.number().min(0),
        product_id: routeUtils.validation.mongooseId,
        type: JOI.string().valid(PRODUCT_TYPE)
      },
      group: `${MODULE.group}`,
      description: 'Api to get Products',
      model: 'getAllProducts'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: productController.getAdminProducts
  },
  {
    path: `/api/getAllProducts`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string()
      }).unknown(),
      query: {
        searchString: JOI.string(),
        searchKey: JOI.string(),
        limit: JOI.number().default(20),
        index: JOI.number().min(0),
        enrolled: JOI.boolean(),
        product_ids: JOI.string(),
        type: JOI.string().valid(PRODUCT_TYPE)
      },
      group: `${MODULE.group}`,
      description: 'Api to get Products',
      model: 'getAllProducts'
    },
    auth: [USER_ROLE.STUDENT],
    handler: productController.getProducts
  },
  {
    path: `/admin/map/quiz`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        content: JOI.array().items(JOI.object({
          product_id: routeUtils.validation.mongooseId,
          question_id: routeUtils.validation.mongooseId,
          priority: JOI.number(),
          status: JOI.boolean()
        })),
        removed_questions: JOI.array().items(JOI.object({
          product_id: routeUtils.validation.mongooseId,
          question_id: routeUtils.validation.mongooseId
        }))
      },
      group: `${MODULE.group}`,
      description: 'Api to map Product and quiz',
      model: 'MapProductQuiz'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: productController.mapProductQuiz
  },
  {
    path: `/api/product/:id`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId
      },
      body: {
        name: JOI.string(),
        heading: JOI.string(),
        strikeprice: JOI.number(),
        price: JOI.number(),
        isPaid: JOI.boolean(),
        similar_products: JOI.array().items(routeUtils.validation.mongooseId),
        description: JOI.string(),
        type: JOI.string().valid(['1', '2', '3', '4']).description("1->PDF, 2->quiz, 3->books, 4-> course"),
        priority: JOI.number(),
        product_meta: JOI.object(),
        status: JOI.boolean(),
        benefits: JOI.array().items(JOI.string()),
        image: JOI.object({
          type: JOI.string().valid(['1', '2', '3']).description("1->PDF, 2->quiz, 3->books, 4-> course"),
          image_path: JOI.string(),
          priority: JOI.number()
        }),
        new_items: JOI.array().items(JOI.string()),
        removed_items: JOI.array().items(JOI.string())
      },
      group: `${MODULE.group}`,
      description: 'Api to update product by id',
      model: 'UpdateProduct'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: productController.updateProductByID
  },
  {
    path: `/api/flushProductCache`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      query: {
        product_ids: JOI.string()
      },
      group: `${MODULE.group}`,
      description: 'Api to flush Products cache',
      model: 'flushProductCache'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN, USER_ROLE.STUDENT],
    handler: productController.flushProductsCache
  },
  {
    path: `/api/getEnrolledProducts`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      group: `${MODULE.group}`,
      description: 'Api to get enrolled Products',
      model: 'getEnrolledProducts'
    },
    auth: [USER_ROLE.STUDENT],
    handler: productController.getEnrolledProducts
  }
]
module.exports = routes;