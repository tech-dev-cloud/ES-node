const { Product } = require('../../mongo-models/product');
const params = require('../../../config/env/development_params.json');
const { PRODUCTS_TYPE } = require('../../utils/constants');
const service = {
  getProducts: async (query) => {
    let condition = {
      status: true,
      isPublish: true,
      ...(request.query.type ? { type: request.query.type } : {}),
    };
    let product_ids = await getProductsFromDB(condition, { _id: 1 });
    let products = [];
    for (const productId of product_ids) {
      products.push(getProductsFromRedis(productId));
    }
    products = await Promise.all(products);
  },
};

function getProductsFromDB(condition, projection) {
  return Product.find(condition, projection).lean();
}

function getProductsFromRedis(product_id) {
  const cacheKey = `${params.product_cache_key}${product_id.toString()}`;
  return new Promise((resolve, reject) => {
    redis.get(cacheKey, async (err, someData) => {
      let product;
      if (!err && !someData) {
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
      // if (product) {
      //   if (product.strikeprice) {
      //     // calculate discount percentage
      //     product['discountPercent'] = Math.ceil(
      //       ((product.strikeprice - product.price) * 100) /
      //         product.strikeprice
      //     );
      //   }
      //   product.image = product.image.map(
      //     (prod_image) => prod_image.image_path
      //   );
      //   product['weburl'] = service.getRedirectUrl(product.type);
      //   // Get Product rating
      //   let obj = service.getProductRating(product_id);
      //   const promise = [obj];

      //   promise.push(getProductOffers(product._id));

      //   // Get totoal enrollment
      //   if (
      //     (product.type == params.product_types.course ||
      //       product.type == PRODUCTS_TYPE.test_series) &&
      //     product.early_birds_offer &&
      //     product.early_birds_offer.length
      //   ) {
      //     promise.push(
      //       service.totalEnrolled(product._id, [order_status.credit])
      //     );
      //   }
      //   const result = await Promise.all(promise);
      //   obj = result[0];
      //   product['offers'] = result[1];
      //   if (result[2] >= 0) {
      //     product['totalEnrolled'] = result[1];
      //     service.applyEarlyBirdOffer(product);
      //   }
      //   product['rating'] = obj.rating;
      //   product['reviews'] = obj.counts;
      // }
      resolve(product);
    });
  });
}
function getRedirectUrl(productType) {
  switch (productType) {
    case PRODUCTS_TYPE.notes:
      return 'pdf-4';
    case PRODUCTS_TYPE.quiz:
      return 'quiz-5';
    case PRODUCTS_TYPE.bulk:
      return 'bulk-2';
    case PRODUCTS_TYPE.course:
      return 'course-1';
    case PRODUCTS_TYPE.test_series:
      return 'test-3';
  }
}
function getProductRating(productId) {
  const data = await Comment.find(
    { object_id: product_id, type: params.review_type.product_review },
    { rating: 1 }
  ).lean();
  if (data && data.length) {
    const sum = data.reduce((acc, curvalue) => acc + curvalue.rating, 0);
    return { rating: Math.ceil(sum / data.length), counts: data.length };
  }
  return { rating: 0, counts: 0 };
}
async function totalEnrolled(product_id, orderStatus = []) {
  orderStatus = orderStatus.length
    ? orderStatus
    : Object.values(order_status);
  const count = await Order.find({
    product_id,
    order_status: { $in: orderStatus },
  }).count();
  return count;
}
module.exports = service;
