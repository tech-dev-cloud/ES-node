module.exports = [
  ...require('./authRoutes'),
  ...require('./subjectRoutes'),
  ...require('./questionRoutes'),
  ...require('./unitRoutes'),
  ...require('./quizRoutes'),
  ...require('./paymentRoutes'),
  ...require('./userRoutes'),
  ...require('./performanceRoutes'),
  ...require('./file'),
  ...require('./modules'),
  ...require('./dummy')
]