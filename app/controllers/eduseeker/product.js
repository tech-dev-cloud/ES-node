const async = require('async');
const _ = require('lodash');
const Mongoose = require('mongoose');
const {
  Product: ProductModel,
  ProductImage,
  ProductQuestionMap,
  Document,
  Comment,
  UserModel,
} = require('../../mongo-models');
const config = require('../../../config/config');
let params = require(`../../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../../config/redisConnection');
const { aws } = require('../../services/aws');
const { productService, ProductService } = require('../../services');
let { Product } = require('../../models/shop');
const {
  review_type,
  order_status,
  PRODUCTS_TYPE,
} = require('../../utils/constants');
const logger = require('../../../config/winston');
const { NOT_ENROLLED } = require('../../utils/errorCodes');

let productController = {
  createProduct: async (request, response) => {
    let product_payload = { ...request.body, created_by: request.user._id };
    productService.createProduct(product_payload).then(res=>{
      response.status(200).json({
        success: true,
        message: 'Product created successfully',
      });
    }).catch(err=>{
      response.status(500).json({
        success: false,
        message: 'Something went wrong',
        debug: err
      });
    });
  },
  mapProductQuiz: async (request, response) => {
    await ProductQuestionMap.insertMany(request.body.content);
    response.status(200).json({
      success: true,
      message: 'Product map successfully',
    });
  },
  getAdminProducts: async (request, response) => {
    let productMetaData;
    let responseData;
    let limit = request.query.limit || 10;
    let skip =
      (parseInt(request.query.skip || 1) - 1) * request.query.limit || 0;
    let match = {
      created_by: request.user._id,
    };
    let prodcut_type = request.query.type;
    if (request.query.product_id) {
      match['_id'] = request.query.product_id;
    }
    if (prodcut_type) {
      match['type'] = prodcut_type;
    }
    if (request.query.searchString) {
      match['type'] = { $ne: PRODUCTS_TYPE.bulk };
      match['$text'] = { $search: request.query.searchString };
    }
    try {
      let data = await ProductModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'products',
            localField: 'similar_products',
            foreignField: '_id',
            as: 'similar_products_info',
          },
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quizData',
          },
        },
        {
          $project: {
            'quizData.questionList': 0,
            'quizData.createdAt': 0,
            'quizData.updatedAt': 0,
            'quizData.createdBy': 0,
          },
        },
        { $sort: { _id: -1 } },
        {
          $group: { _id: null, count: { $sum: 1 }, items: { $push: '$$ROOT' } },
        },
        { $addFields: { items: { $slice: ['$items', skip, limit] } } },
      ]);
      responseData = { ...data[0] };
      if (request.query.product_id) {
        productMetaData = await productService.getProductMeta(data[0].items[0]);
        responseData = { ...responseData, productMetaData };
        if (data[0].items[0].type == PRODUCTS_TYPE.bulk) {
          responseData.items[0].sub_products_info = await ProductModel.find({
            _id: { $in: data[0].items[0].sub_products },
          }).lean();
        }
      }
    } catch (err) {
      console.log(err);
    }
    response.status(200).json({
      success: true,
      message: 'Product fethed successfull',
      data: responseData,
    });
  },
  updateProductByID: async (request, response) => {
    if (request.body.type == PRODUCTS_TYPE.bulk) {
      request.body['sub_products'] = request.body.product_map_data.map(
        (product_id) => Mongoose.Types.ObjectId(product_id)
      );
    } else if (request.body.type == PRODUCTS_TYPE.test_series) {
      request.body['quizId'] = request.body.product_map_data.map((quizId) =>
        Mongoose.Types.ObjectId(quizId)
      );
    }
    await ProductModel.updateOne({ _id: request.params.id }, request.body);
    switch (request.body.type) {
      case PRODUCTS_TYPE.notes: //Document Update
        const data = request.body.product_map_data.map((obj) => ({
          ...obj,
          user_id: request.user._id,
          product_id: request.params.id,
        }));
        await Document.insertMany(data);
        break;
      case PRODUCTS_TYPE.quiz: //Quiz
        try {
          commonF.updateQuiz(request.body, request.params.id);
        } catch (err) {
          console.log(err);
        }
        break;
      case PRODUCTS_TYPE.bulk: //Bulk
        break;
    }
    response.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  },
  async getProducts(request, response) {
    let data = [];
    let product_ids = [];
    let products = [];
    if (request.query.enrolled) {
      product_ids = await productService.getEnrolledProductIds(
        request.user._id
      );
    } else {
      let condition = {
        status: true,
        isPublish: true,
        ...(request.query.type ? { type: request.query.type } : {}),
      };
      product_ids = await ProductModel.find(condition, { _id: 1 })
        .sort({ priority: -1 })
        .lean();
      product_ids = product_ids.map((obj) => obj._id);
    }
    let product_promise = [];
    let product_user_review_promise = [];
    for (const productId of product_ids) {
      let currentProduct = productService.getProduct(productId);
      if (request.query.enrolled) {
        let user_review = productService.getUserProductReview(
          productId,
          request.user._id,
          review_type.product_review
        );

        product_user_review_promise.push(user_review);
      }
      product_promise.push(currentProduct);
    }
    try {
      let result = await Promise.all([
        Promise.all(product_promise),
        Promise.all(product_user_review_promise),
      ]);
      product_promise = result[0];
      product_user_review_promise = result[1];
      for (let index = 0; index < product_promise.length; index++) {
        let currentProduct = product_promise[index];
        if (currentProduct) {
          if (request.query.enrolled && product_user_review_promise.length) {
            const service = new ProductService();
            await service.getProductMetaData(currentProduct, request.user._id);
            if (
              product_user_review_promise[index] &&
              product_user_review_promise[index].length
            ) {
              currentProduct.userRating = {
                review_id: product_user_review_promise[index][0]._id,
                rating: product_user_review_promise[index][0].rating,
                message: product_user_review_promise[index][0].message,
              };
            }
          }
          products.push(currentProduct);
        }
      }
    } catch (err) {
      logger.error(err);
    }
    if (!request.query.type) {
      data = productService.categorizeProduct(products);
    }
    response.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data,
    });
  },
  getProductDetails: async (request, response) => {
    const product_id = request.params.product_id;
    let enrolled = request.query.enrolled == 'true';
    const prodService = new ProductService();
    let responsePayload = {};

    try {
      let result = await Promise.all([
        prodService.getProduct(request.params.product_id),
        prodService.isProductPurchased(product_id, request.user),
      ]);
      let product = new Product(result[0]);
      const enrolledStatus = [];
      if (
        product.type == PRODUCTS_TYPE.course ||
        product.type == PRODUCTS_TYPE.test_series
      ) {
        enrolledStatus.push(order_status.credit);
      }
      let count = await prodService.totalEnrolled(product_id, enrolledStatus);
      product['totalEnrolled'] = enrolledStatus.length ? count : count * 2;

      let obj = result[1];
      product['purchaseStatus'] = obj.purchased;
      await prodService.getProductMetaData(product);
      // if (product.type == PRODUCTS_TYPE.bulk) {
      //   product['sub_products'] = await Promise.all(
      //     product.sub_products.map(async (product_id) => {
      //       let obj = await productService.getProduct(product_id);
      //       return obj;
      //     })
      //   );
      // } else if (
      //   product.type == PRODUCTS_TYPE.notes &&
      //   request.query.enrolled
      // ) {
      //   let docs = await Document.find(
      //     { product_id: product._id, status: true },
      //     { _id: 1, filename: 1, url: 1, size: 1, mime_type: 1 }
      //   ).lean();
      //   product['docs'] = docs;
      // }
      if (enrolled) {
        if (!product.purchaseStatus) {
          throw NOT_ENROLLED;
        }
        await product.userRatingReview(request.user._id);
      }
      // if (product.type == PRODUCTS_TYPE.course) {
      //   responsePayload.contents = await product.videoContent(enrolled);
      // }
      response.status(200).json({
        success: true,
        message: 'Product fetched successfully',
        data: { ...product, ...responsePayload },
      });
    } catch (err) {
      throw err;
    }
  },
  flushProductsCache: async (request, response) => {
    let ids;
    if (request.query.product_ids) {
      ids = request.query.product_ids.split(',');
    }
    let keys;
    if (ids && ids.length) {
      keys = ids.map((id) => params.product_cache_key + id);
    } else {
      let products = await ProductModel.find(
        { status: true },
        { _id: 1 }
      ).lean();
      keys = products.map(
        (obj) => params.product_cache_key + obj._id.toString()
      );
    }
    await ProductModel.updateMany(
      { _id: { $in: ids } },
      {
        $set: { isPublish: true },
      }
    );
    redis.del(keys, (err) => {
      if (!err) {
        response.status(200).json({
          success: true,
          message: 'Successfully refresh',
        });
      }
    });
  },
  addReview: async (request, response) => {
    let reviewType = request.body.type;
    let obj;
    try {
      if (reviewType == review_type.product_review) {
        let data = await productService.isProductPurchased(
          request.body.object_id,
          request.user._id
        );
        if (data) {
          const data = await Comment.findOneAndUpdate(
            { object_id: request.body.object_id, created_by: request.user._id },
            request.body,
            { new: true, upsert: true, setDefaultsOnInsert: true }
          ).lean();
          response.status(200).json({
            success: true,
            data,
          });
          return;
        }
        throw NOT_ENROLLED;
      } else {
        obj = new Comment({ ...request.body, created_by: request.user._id });
      }
      let comment = (await obj.save()).toObject();
      comment.user = request.user;
      response.status(200).json({
        success: true,
        data: comment,
      });
    } catch (err) {
      throw err;
    }
  },
  getReviews: async (request, response) => {
    let last_doc_id = request.query.last_doc_id;
    let limit = request.query.limit || 990;
    const object_id = request.query.object_id;
    const review_type = request.query.type;
    let comments = await productService.getComments(
      object_id,
      null,
      null,
      review_type,
      last_doc_id,
      limit
    );
    let subComments = [];
    if (review_type != params.review_type.product_review) {
      for (let index = 0; index < comments.length; index++) {
        let promise = productService.getComments(
          null,
          null,
          comments[index]._id,
          review_type,
          null,
          999999
        );
        subComments[index] = promise;
      }
      let data = await Promise.all(subComments);
      for (let index = 0; index < data.length; index++) {
        if (data[index]) {
          comments[index].commentData = data[index];
          comments[index].commentCounts = data[index].length;
        }
      }
    }
    if (review_type == params.review_type.product_review) {
      comments.sort((a, b) => b.priority - a.priority);
    }
    response.status(200).json({
      success: true,
      data: { comments },
    });
  },
  async updateReviewStatus(request, response) {
    const object_id = request.body.object_id;
    const type = request.body.type;
    try {
      if (type == params.review_type.product_review) {
        const product = await productService.getProduct(object_id);
        if (product.created_by != request.user._id.toString()) {
          throw new Error("You can't changes this comment status");
        }
        if (request.body.id) {
          await Comment.findOneAndUpdate(
            { _id: request.body.id },
            request.body
          );
        } else {
          const user = await UserModel.findOne(
            { email: request.body.email },
            { _id: 1 }
          ).lean();
          let obj = new Comment({ ...request.body, created_by: user._id });
          let data = await obj.save();
        }
      }
      response.status(200).send();
    } catch (err) {
      response.status(400).json({
        success: false,
        message: err,
      });
    }
  },
};
let commonF = {
  updateQuiz: async (payload, product_id) => {
    return new Promise((resolve, reject) => {
      async.auto(
        {
          updateImage: async () => {
            if (payload.image) {
              let obj = await ProductImage.findOne({ product_id }).lean();
              if (obj && obj.Key) {
                let params = {
                  Bucket: process.env.BUCKET_NAME,
                  Key: obj.key,
                };
                aws.deleteFile(params);
                await ProductImage.updateOne({ product_id }, payload.image);
              } else {
                let image = new ProductImage({ ...payload.image, product_id });
                await image.save();
              }
            }
          },
          updateQuizMap: async () => {
            if (payload.removed_items && payload.removed_items.length) {
              await ProductQuestionMap.deleteMany({
                product_id,
                question_id: { $in: payload.removed_items },
              });
            }
            if (payload.new_items && payload.new_items.length) {
              let data = payload.new_items.map((question_id) => ({
                question_id,
                product_id,
              }));
              await ProductQuestionMap.insertMany(data);
            }
          },
        },
        function (err) {
          if (!err) {
            resolve(true);
          } else {
            reject(err);
          }
        }
      );
    });
  },
};

module.exports = { productController };
