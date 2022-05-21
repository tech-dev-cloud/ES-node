module.exports = {
  ...require('./authService'),
  ...require('../modules/subjects/subject-service'),
  ...require('./questionService'),
  ...require('./unitService'),
  ...require('./paymentService'),
  ...require('./userService'),
  ...require('./performanceService'),
  ...require('./aws'),
  ...require('./product'),
  ...require('./userService'),
};
