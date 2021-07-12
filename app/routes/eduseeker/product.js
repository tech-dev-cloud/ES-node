
const JOI = require('joi');
const { USER_ROLE, PRODUCTS_TYPE } = require('../../utils/constants');
const { productController } = require('../../controllers');
const routeUtils = require('../../utils/routeUtils');

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
        name: JOI.string(),
        heading: JOI.string(),
        strikeprice: JOI.number(),
        price: JOI.number(),
        isPaid: JOI.boolean(),
        similar_products: JOI.array().items(routeUtils.validation.mongooseId),
        description: JOI.string().optional(),
        type: JOI.string().valid().description("1->PDF, 2->quiz, 3->books, 4-> course"),
        priority: JOI.number().default(0),
        product_meta: JOI.object(),
        status: JOI.boolean(),
        benefits: JOI.array().items(JOI.string()),
        requirements: JOI.array().items(JOI.string()),
        cover_image: JOI.string(),
        promo_video_url: JOI.string(),
        validity: JOI.number(),
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
        limit: JOI.number(),
        skip: JOI.number().min(0),
        product_id: routeUtils.validation.mongooseId,
        type: JOI.string().valid(PRODUCTS_TYPE)
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
        payment_request_id: JOI.string(),
        type: JOI.string().valid(PRODUCTS_TYPE)
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
        strikeprice: JOI.number().optional(),
        price: JOI.number(),
        isPaid: JOI.boolean(),
        similar_products: JOI.array().items(routeUtils.validation.mongooseId),
        description: JOI.string(),
        type: JOI.string().valid(['1', '2', '3', '4']).description("1->PDF, 2->quiz, 3->books, 4-> course"),
        priority: JOI.number(),
        product_meta: JOI.object(),
        status: JOI.boolean(),
        benefits: JOI.array().items(JOI.string()),
        validity: JOI.number(),
        image: JOI.object({
          type: JOI.string().valid(['1', '2', '3']).description("1->PDF, 2->quiz, 3->books, 4-> course"),
          image_path: JOI.string(),
          priority: JOI.number()
        }),
        new_items: JOI.array().items(JOI.string()),
        removed_items: JOI.array().items(JOI.string()),
        product_map_data: JOI.array().items(JOI.any())
      },
      group: `${MODULE.group}`,
      description: 'Api to update product by id',
      model: 'UpdateProduct'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: productController.updateProductByID
  },
  {
    path: '/api/getProduct/:product_id',
    method: 'GET',
    joiSchemaForSwagger: {
      params: JOI.object({
        product_id: routeUtils.validation.mongooseId
      }),
      group: `${MODULE.group}`,
      description: 'Api to get Product by ID',
      model: 'GetProduct'
    },
    auth: [USER_ROLE.STUDENT],
    handler: productController.getProductDetails
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
  },
  {
    path: '/api/reviews',
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        message: JOI.string(),
        type: JOI.string().valid(['product_review', 'lecture_query', 'feedback']).required(),
        object_id: routeUtils.validation.mongooseId,
        parent_id: routeUtils.validation.mongooseId,
        rating: JOI.number(),
        status: JOI.boolean(),
        review_id: routeUtils.validation.mongooseId
      },
      group: 'Reviews',
      description: 'Api to add review',
      model: 'addReview'
    },
    auth: [USER_ROLE.STUDENT, USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: productController.addReview
  },
  {
    path: '/api/reviews',
    method: 'GET',
    joiSchemaForSwagger: {
      query: {
        object_id: routeUtils.validation.mongooseId,
        type: JOI.string().valid(['product_review', 'lecture_query', 'feedback']),
        last_doc_id: routeUtils.validation.mongooseId
      },
      group: 'Reviews',
      description: 'Api to get review',
      model: 'getReview'
    },
    auth: [USER_ROLE.STUDENT, USER_ROLE.ADMIN, USER_ROLE.TEACHER],
    handler: productController.getReviews
  },
  {
    path: '/api/reviews',
    method: 'PUT',
    joiSchemaForSwagger: {
      body: {
        object_id: routeUtils.validation.mongooseId,
        type: JOI.string().valid(['product_review', 'lecture_query', 'feedback']),
        status:JOI.boolean(),
        rating:JOI.number(),
        message:JOI.string(),
        approved_type:JOI.number().valid([1,2,3]).description('1=>Top, 2=>middle, 3=>low'),
        id:routeUtils.validation.mongooseId,
        email:JOI.string()
      },
      group: 'Reviews',
      description: 'Api to update review status',
      model: 'getReview'
    },
    auth: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
    handler: productController.updateReviewStatus
  }
]
module.exports = routes;