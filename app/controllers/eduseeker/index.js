module.exports = {
  ...require('./authController'),
  ...require('./questionController'),
  // ...require('./unitController'),
  ...require('./paymentController'),
  ...require('./subscriber'),
  ...require('./performanceController'),
  ...require('./file'),
  ...require('./product'),
  ...require('./module'),
  ...require('./dashboard'),
  ...require('./course'),
  ...require('../../modules/category/controller'),
};
