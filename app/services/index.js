module.exports = {
  ...require('./authService'),
  ...require('./subjectService'),
  ...require('./questionService'),
  ...require('./unitService'),
  ...require('./quizService'),
  ...require('./paymentService'),
  ...require('./userService'),
  ...require('./performanceService'),
  ...require('./aws'),
  ...require('./product'),
}