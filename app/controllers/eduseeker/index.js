module.exports = {
  ...require('./authController'),
  ...require('./subjectController'),
  ...require('./questionController'),
  // ...require('./unitController'),
  ...require('./quizController'),
  ...require('./paymentController'),
  // ...require('./userController'),
  ...require('./performanceController'),
  ...require('./file'),
  ...require('./product'),
  ...require('./module'),
  // ...require('./term'),
}