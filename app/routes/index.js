module.exports = [
  ...require('./eduseeker'),
  ...require('./admin'),
  ...require('../modules/offer/routes'),
  ...require('../modules/notification/notification-routes'),
  ...require('../modules/product/product-routes'),
];
