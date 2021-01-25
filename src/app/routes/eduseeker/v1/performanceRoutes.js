const JOI = require('joi');
const { USER_ROLE, DB } = require('../../../utils/constants');
const { performanceController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

const MODULE = {
  name: 'performance',
  group: 'Performance'
}
const routes = [
  {
    path: `/api/${MODULE.name}`,
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        quizId: routeUtils.validation.mongooseId,
      },
      group: MODULE.group,
      description: 'API to Start a quiz',
      model: 'StartQuiz'
    },
    auth: [USER_ROLE.STUDENT],
    handler: performanceController.startQuiz
  },
  {
    path: `/api/${MODULE.name}`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        product_id: routeUtils.validation.mongooseId,
        userAnswers: JOI.object({
          question_id: routeUtils.validation.mongooseId,
          answer: JOI.array().items(JOI.string().required()),
          status: JOI.valid(Object.values(DB.ANSWER_ACTION)).required()
        }),
      remainingTime: JOI.object({
          hours:JOI.number(),
          minutes:JOI.number(),
          seconds:JOI.number()
        })
      },
      group: MODULE.group,
      description: 'API to save answer of Quiz',
      model: 'SaveAnswer'
    },
    auth: [USER_ROLE.STUDENT],
    handler: performanceController.saveAnswer
  },
  {
    path: `/api/${MODULE.name}/status`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        quizId: routeUtils.validation.mongooseId,
        status: JOI.string().valid(Object.values(DB.QUIZ_PLAY_STATUS)),
        remainingTime: JOI.object({
          hours:JOI.number(),
          minutes:JOI.number(),
          seconds:JOI.number()
        })
      },
      group: MODULE.group,
      description: 'API to save answer of Quiz',
      model: 'SaveAnswer'
    },
    auth: [USER_ROLE.STUDENT],
    handler: performanceController.updateStatus
  },
  {
    path: '/api/submitQuiz',
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body: {
        product_id: routeUtils.validation.mongooseId,
        remainingTime: JOI.object({
          hours:JOI.number(),
          minutes:JOI.number(),
          seconds:JOI.number()
        })
      },
      group: MODULE.group,
      description: 'API to save answer of Quiz',
      model: 'SaveAnswer'
    },
    auth: [USER_ROLE.STUDENT],
    handler: performanceController.submitQuiz
  }
]

module.exports = routes;