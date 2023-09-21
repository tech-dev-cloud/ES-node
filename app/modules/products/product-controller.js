const service = require('./product-service');

const controllers = {
  getProducts: async (req, res) => {
    let condition = {
      status: true,
      isPublish: true,
      ...(request.query.type ? { type: request.query.type } : {}),
    };
    let product_ids = await service.getDBProducts(condition, { _id: 1 });
    product_ids = product_ids.map((obj) => obj._id);
    service.getProductsFromRedis(product_ids);
  },
};

module.exports = controllers;
