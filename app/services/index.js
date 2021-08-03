module.exports = {
  ...require('./authService'),
  ...require('../modules/subjects/service'),
  ...require('./questionService'),
  ...require('./unitService'),
  ...require('./paymentService'),
  ...require('./userService'),
  ...require('./performanceService'),
  ...require('./aws'),
  ...require('./product'),
};
