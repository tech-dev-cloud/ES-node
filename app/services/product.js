const _ = require('lodash');
const { config } = require('../../config/config');
console.log(config.NODE_ENV);
const params = require(`../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../config/redisConnection');
const dbQuery = require('./dbQuery/product');
const taxonomyService = require('../modules/category/service');
const {
  VideoContentModel,
  Order,
  Comment,
  Product,
  ProductQuestionMap,
  Document,
  QuizModel,
  PerformanceModel,
} = require('../mongo-models');
const {
  order_status,
  review_type,
  PRODUCTS_TYPE,
  DB,
} = require('../utils/constants');
const { getProductOffers } = require('../modules/offer/service');

class ProductService {
  constructor() {}
  async getCourseContent(product_id, enrolled = false) {
    const selectedContentFields = ['_id', 'title', 'lectures'];
    const lectureFields = [
      'isPreview',
      'title',
      'description',
      'file_type',
      'duration',
      'url',
    ];
    let contents = await VideoContentModel.find({
      product_id,
      status: true,
    }).lean();
    contents = contents.map((content) => {
      if (!enrolled) {
        content = _.pick(content, selectedContentFields);
        content.lectures = content.lectures.map((lecture) => {
          lecture = _.pick(lecture, lectureFields);
          if (!lecture.isPreview) {
            delete lecture.url;
          }
          return lecture;
        });
      }
      content.lectureCounts = content.lectures.length;
      content.duration = content.lectures.reduce(
        (accum, currentValue) => accum + currentValue.duration,
        0
      );
      return content;
    });
    return contents;
  }
  getRedirectUrl(product_type) {
    let weburl;
    if (product_type == PRODUCTS_TYPE.notes) {
      weburl = 'pdf-4';
    } else if (product_type == PRODUCTS_TYPE.quiz) {
      weburl = 'quiz-5';
    } else if (product_type == PRODUCTS_TYPE.bulk) {
      weburl = 'bulk-2';
    } else if (product_type == PRODUCTS_TYPE.course) {
      weburl = 'course-1';
    } else if (product_type == PRODUCTS_TYPE.test_series) {
      weburl = 'test-3';
    }
    return weburl;
  }
  async getUserProductReview(object_id, created_by, type) {
    const data = await Comment.find({ object_id, created_by, type }).lean();
    return data;
  }
  async getDocuments(product_id, status) {
    return await Document.find({
      product_id,
      status,
    }).lean();
  }
  getQuizzes(quizIds) {
    return QuizModel.find({ _id: { $in: quizIds } });
  }
  async getProductMetaData(product, user_id) {
    switch (product.type) {
      case PRODUCTS_TYPE.bulk:
        const sub_products = [];
        for (const id of product.sub_products) {
          const obj = service.getProduct(id);
          sub_products.push(obj);
        }
        product.sub_products = await Promise.all(sub_products);
        break;
      case PRODUCTS_TYPE.notes:
        product['docs'] = await this.getDocuments(product._id, true);
        break;
      case PRODUCTS_TYPE.course:
        product.contents = await this.getCourseContent(product._id, true);
        break;
      case PRODUCTS_TYPE.test_series:
        const quizzes = await this.getQuizzes(product.quizId);
        product.tests = quizzes.map((obj) => {
          obj = _.pick(obj, [
            '_id',
            'title',
            'heading',
            'type',
            'exam',
            'difficultLevel',
            'totalQuestions',
            'attemptTime',
            'questionList',
          ]);
          return {
            ...obj,
            ...(obj.questionList && obj.questionList.length
              ? {}
              : { pending: true }),
          };
        });
        const playStatus = await this.getHoldQuiz(
          user_id,
          quizzes.map((obj) => obj._id)
        );
        const keyByQuiz = _.keyBy(playStatus, 'product_id');
        for (const quiz of product.tests) {
          quiz.playStatus = keyByQuiz[quiz._id];
        }
        break;
      case PRODUCTS_TYPE.quiz:
        const quizPlayStatus = await this.getHoldQuiz(user_id, [product._id]);
        if (quizPlayStatus.length) {
          product.playStatus = quizPlayStatus[0];
        }
        break;
    }
  }
  async isProductPurchased(product_id, user_id) {
    const purchaseData = await Order.findOne({
      product_id,
      user_id: user_id,
      order_status: { $in: ['Credit', 'Free'] },
    }).lean();
    if (purchaseData) {
      return {
        purchased: true,
        validity: purchaseData.validity,
      };
    } else {
      return {
        purchased: false,
      };
    }
  }
  async getProduct(product_id) {
    const cacheKey = `${params.product_cache_key}${product_id.toString()}`;
    return new Promise((resolve, reject) => {
      redis.get(cacheKey, async (err, someData) => {
        let product;
        if (err || !someData) {
          const match = {};
          match['_id'] = product_id;
          const data = await Product.aggregate([
            { $match: match },
            {
              $lookup: {
                from: 'product_images',
                let: { id: '$_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$product_id', '$$id'] } } },
                  { $project: { image_path: 1 } },
                ],
                as: 'image',
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { id: '$created_by' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
                  { $project: { name: 1 } },
                ],
                as: 'mentorInfo',
              },
            },
            { $unwind: '$mentorInfo' },
          ]);
          redis.set(cacheKey, JSON.stringify(data[0]), () => {
            redis.expire(cacheKey, params.product_cache_expiry);
          });
          product = data[0];
        } else {
          product = JSON.parse(someData);
        }
        if (product) {
          if (product.strikeprice) {
            product['discountPercent'] = Math.ceil(
              ((product.strikeprice - product.price) * 100) /
                product.strikeprice
            );
          }
          product.image = product.image.map(
            (prod_image) => prod_image.image_path
          );
          product['weburl'] = service.getRedirectUrl(product.type);
          let obj = service.getProductRating(product_id);
          const promise = [obj];
          if (
            (product.type == params.product_types.course ||
              product.type == params.product_types.test_series) &&
            product.early_birds_offer &&
            product.early_birds_offer.length
          ) {
            promise.push(
              this.totalEnrolled(product._id, [order_status.credit])
            );
          }
          const result = await Promise.all(promise);
          obj = result[0];
          if (result[1] >= 0) {
            product['totalEnrolled'] = result[1];
            service.applyEarlyBirdOffer(product);
          }
          product['rating'] = obj.rating;
          product['reviews'] = obj.counts;
        }
        resolve(product);
      });
    });
  }
  async totalEnrolled(product_id, orderStatus = []) {
    orderStatus = orderStatus.length
      ? orderStatus
      : Object.values(order_status);
    const count = await Order.find({
      product_id,
      order_status: { $in: orderStatus },
    }).count();
    return count;
  }
  getHoldQuiz(user_id, quizIds = []) {
    return PerformanceModel.find(
      {
        user_id,
        product_id: { $in: quizIds },
        status: { $ne: DB.QUIZ_PLAY_STATUS.COMPLETED },
      },
      { _id: 1, status: 1, user_id: 1, product_id: 1 }
    ).lean();
  }
}

const service = {
  createProduct: async (productPayload) => {
    switch (productPayload.type) {
      case PRODUCTS_TYPE.bulk:
        productPayload['sub_products'] = request.body.product_map_data.map(
          (product_id) => Mongoose.Types.ObjectId(product_id)
        );
        break;
      case PRODUCTS_TYPE.quiz:
        productPayload.product_meta['totalQuestions'] =
          request.body.product_map_data.length;
        break;
      case PRODUCTS_TYPE.test_series:
        productPayload['quizId'] = request.body.product_map_data.map((quizId) =>
          Mongoose.Types.ObjectId(quizId)
        );
        break;
    }
    // Save Product in db
    const product = await dbQuery.createProduct(productPayload);
    let data;
    if (productPayload.product_map_data) {
      // Map Product Id
      switch (productPayload.type) {
        case PRODUCTS_TYPE.notes:
          data = productPayload.product_map_data.map((obj) => ({
            ...obj,
            user_id: request.user._id,
            product_id: product._id,
          }));
          await dbQuery.insertMultipleDocuments(data);
          break;
        case PRODUCTS_TYPE.quiz:
          data = productPayload.product_map_data.map((question_id) => ({
            question_id,
            product_id: product._id,
          }));
          await dbQuery.productQuestionInsert(data);
          break;
      }
    }
    if (productPayload.term_ids) {
      await taxonomyService.replaceProductTaxonomy(
        product._id,
        productPayload.term_ids
      );
    }
  },
  async getCourseContent(product_id, enrolled = false) {
    const selectedContentFields = ['_id', 'title', 'lectures'];
    const lectureFields = [
      'isPreview',
      'title',
      'description',
      'file_type',
      'duration',
      'url',
    ];
    let contents = await VideoContentModel.find({
      product_id,
      status: true,
    }).lean();
    contents = contents.map((content) => {
      if (!enrolled) {
        content = _.pick(content, selectedContentFields);
        content.lectures = content.lectures.map((lecture) => {
          lecture = _.pick(lecture, lectureFields);
          if (!lecture.isPreview) {
            delete lecture.url;
          }
          return lecture;
        });
      }
      content.lectureCounts = content.lectures.length;
      content.duration = content.lectures.reduce(
        (accum, currentValue) => accum + currentValue.duration,
        0
      );
      return content;
    });
    return contents;
  },
  updateProduct: async () => {},
  /**
   * Function Check whether spesified user purchased spesific product of not
   * @param {*} product_id
   * @param {*} user_id
   * @returns {*} {purchased, validity}
   */
  async isProductPurchased(product_id, user_id) {
    const purchaseData = await Order.findOne({
      product_id,
      user_id: user_id,
      order_status: { $in: ['Credit', 'Free'] },
    }).lean();
    if (purchaseData) {
      return {
        purchased: true,
        validity: purchaseData.validity,
      };
    }
    return {
      purchased: false,
    };
  },
  async getComments(
    object_id,
    status,
    parent_comment_id,
    reviewType,
    last_doc_id,
    limit
  ) {
    if (last_doc_id) {
      return [];
    }
    const $match = { type: reviewType };
    if (status) {
      $match.status = status;
    }
    if (last_doc_id) {
      $match._id = { $gt: last_doc_id };
    }
    if (object_id) {
      $match.object_id = object_id;
    }
    $match.parent_id = parent_comment_id || null;
    const $sort =
      reviewType == review_type.product_review
        ? { approved_type: 1 }
        : { _id: 1 };
    const $lookup = {
      from: 'users',
      localField: 'created_by',
      foreignField: '_id',
      as: 'user',
    };
    const $unwind = '$user';
    const $project = { 'user.createdAt': 0, 'user.password': 0 };
    const $limit = limit;
    const query = [
      { $match },
      { $sort },
      { $lookup },
      { $unwind },
      { $project },
      { $limit },
    ];
    const data = await Comment.aggregate(query);
    return data;
  },
  getRedirectUrl(product_type) {
    let weburl;
    if (product_type == PRODUCTS_TYPE.notes) {
      weburl = 'pdf-4';
    } else if (product_type == PRODUCTS_TYPE.quiz) {
      weburl = 'quiz-5';
    } else if (product_type == PRODUCTS_TYPE.bulk) {
      weburl = 'bulk-2';
    } else if (product_type == PRODUCTS_TYPE.course) {
      weburl = 'course-1';
    } else if (product_type == PRODUCTS_TYPE.test_series) {
      weburl = 'test-3';
    }
    return weburl;
  },
  async totalEnrolled(product_id, orderStatus = []) {
    orderStatus = orderStatus.length
      ? orderStatus
      : Object.values(order_status);
    const count = await Order.find({
      product_id,
      order_status: { $in: orderStatus },
    }).count();
    return count;
  },
  getProduct: async (product_id) => {
    const cacheKey = `${params.product_cache_key}${product_id.toString()}`;
    return new Promise((resolve, reject) => {
      redis.get(cacheKey, async (err, someData) => {
        let product;
        if (!err && !someData) {
          const match = {};
          match['_id'] = product_id;
          // Get Product Images, mentor info, and product data
          const data = await Product.aggregate([
            { $match: match },
            {
              $lookup: {
                from: 'product_images',
                let: { id: '$_id' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$product_id', '$$id'] } } },
                  { $project: { image_path: 1 } },
                ],
                as: 'image',
              },
            },
            {
              $lookup: {
                from: 'users',
                let: { id: '$created_by' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$id'] } } },
                  { $project: { name: 1 } },
                ],
                as: 'mentorInfo',
              },
            },
            { $unwind: '$mentorInfo' },
          ]);
          redis.set(cacheKey, JSON.stringify(data[0]), () => {
            redis.expire(cacheKey, params.product_cache_expiry);
          });
          product = data[0];
        } else {
          product = JSON.parse(someData);
        }
        if (product) {
          if (product.strikeprice) {
            // calculate discount percentage
            product['discountPercent'] = Math.ceil(
              ((product.strikeprice - product.price) * 100) /
                product.strikeprice
            );
          }
          product.image = product.image.map(
            (prod_image) => prod_image.image_path
          );
          product['weburl'] = service.getRedirectUrl(product.type);
          // Get Product rating
          let obj = service.getProductRating(product_id);
          const promise = [obj];

          promise.push(getProductOffers(product._id));

          // Get totoal enrollment
          if (
            (product.type == params.product_types.course ||
              product.type == PRODUCTS_TYPE.test_series) &&
            product.early_birds_offer &&
            product.early_birds_offer.length
          ) {
            promise.push(
              service.totalEnrolled(product._id, [order_status.credit])
            );
          }
          const result = await Promise.all(promise);
          obj = result[0];
          product['offers'] = result[1];
          if (result[2] >= 0) {
            product['totalEnrolled'] = result[1];
            service.applyEarlyBirdOffer(product);
          }
          product['rating'] = obj.rating;
          product['reviews'] = obj.counts;
        }
        resolve(product);
      });
    });
  },
  getProductMeta: async (product) => {
    let data;
    switch (product.type) {
      case PRODUCTS_TYPE.notes:
        data = await Document.find({
          product_id: product._id,
          status: true,
        }).lean();
        break;
      case PRODUCTS_TYPE.quiz:
        // data = await ProductQuestionMap.find({
        //   product_id: product._id,
        //   status: true,
        // }).lean();
        data = await ProductQuestionMap.aggregate([
          { $match: { product_id: product._id, status: true } },
          { $project: { question_id: 1 } },
          {
            $lookup: {
              from: 'questions',
              localField: 'question_id',
              foreignField: '_id',
              as: 'questionData',
            },
          },
          { $unwind: '$questionData' },
          {
            $project: {
              'questionData._id': 1,
              'questionData.options': 1,
              'questionData.correctOption': 1,
              'questionData.subjectId': 1,
              'questionData.question': 1,
              'questionData.description': 1,
              'questionData.moduleId': 1,
              'questionData.type': 1,
            },
          },
        ]);
        break;
    }
    return data;
  },
  getUserProductReview: async (object_id, created_by, type) => {
    return await Comment.find({ object_id, created_by, type }).lean();
  },
  getProductRating: async (product_id) => {
    const data = await Comment.find(
      { object_id: product_id, type: params.review_type.product_review },
      { rating: 1 }
    ).lean();
    if (data && data.length) {
      const sum = data.reduce((acc, curvalue) => acc + curvalue.rating, 0);
      return { rating: Math.ceil(sum / data.length), counts: data.length };
    }
    return { rating: 0, counts: 0 };
  },
  async getEnrolledProductIds(user_id) {
    let product_ids = [];
    const enrolledProducts = await Order.find(
      {
        user_id: user_id,
        product_type: { $ne: 'bulk' },
        $or: [{ order_status: 'Free' }, { order_status: 'Credit' }],
      },
      { product_id: 1, validity: 1 }
    )
      .sort({ _id: -1 })
      .lean();
    product_ids = enrolledProducts.map((product) => product.product_id);
    return product_ids;
  },
  applyEarlyBirdOffer(product) {
    for (const offer of product.early_birds_offer) {
      if (product.totalEnrolled < offer.enrolled_limit) {
        product['discountPrice'] = product.strikeprice - offer.price;
        product.price = offer.price;
        product['discountPercent'] = Math.ceil(
          ((product.strikeprice - product.price) * 100) / product.strikeprice
        );
        break;
      }
    }
  },
  categorizeProduct(products) {
    const data = [];
    products = _.groupBy(products, (obj) => obj.type);
    for (const key in products) {
      const item = { title: '', weburl: '', products: products[key] };
      if (key == PRODUCTS_TYPE.notes) {
        item.id = 4;
        item.priority = 4;
        item.title = 'PDF/E-Books';
        item.weburl = `pdf-${item.id}`;
        data.push(item);
      } else if (key == PRODUCTS_TYPE.quiz) {
        item.id = 5;
        item.priority = 5;
        item.title = 'Quiz';
        item.weburl = `quiz-${item.id}`;
        data.push(item);
      } else if (key == PRODUCTS_TYPE.bulk) {
        item.id = 2;
        item.priority = 3;
        item.title = 'Bulk Package';
        item.weburl = `bulk-${item.id}`;
        data.push(item);
      } else if (key == PRODUCTS_TYPE.course) {
        item.id = 1;
        item.priority = 1;
        item.title = 'Courses';
        item.weburl = `course-${item.id}`;
        data.push(item);
      } else if (key == PRODUCTS_TYPE.test_series) {
        item.id = 3;
        item.priority = 2;
        item.title = 'Test Series';
        item.weburl = `test-${item.id}`;
        data.push(item);
      }
    }
    data.sort((a, b) => a.priority - b.priority);
    return data;
  },
};
module.exports = { productService: service, ProductService };
