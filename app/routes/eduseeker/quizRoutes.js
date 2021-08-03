const JOI = require('joi');
const { quizController } = require('../../modules/quiz/quizController');
const { USER_ROLE, DIFFICULT_LEVEL } = require('../../utils/constants');
const routeUtils = require('../../utils/routeUtils');

const routes = [
  {
    path: '/api/quiz',
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      body: {
        title: JOI.string().required(),
        subjectId: routeUtils.validation.mongooseId,
        headline: JOI.string(),
        difficultLevel: JOI.string().valid(Object.values(DIFFICULT_LEVEL)),
        exam: JOI.string(),
        type: JOI.string(),
        questionList: JOI.array().items(routeUtils.validation.mongooseId),
        attemptTime: JOI.number().required(),
      },
      group: 'QUIZ',
      description: 'Api to create Quiz',
      model: 'CreateQuiz',
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.createQuiz,
  },
  {
    path: '/api/quiz/:id',
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId.required(),
      },
      body: {
        title: JOI.string(),
        subjectId: routeUtils.validation.mongooseId,
        headline: JOI.string(),
        difficultLevel: JOI.string().valid(Object.values(DIFFICULT_LEVEL)),
        type: JOI.string(),
        exam: JOI.string(),
        questionList: JOI.array().items(routeUtils.validation.mongooseId),
        attemptTime: JOI.number(),
      },
      group: 'QUIZ',
      description: 'Api to Update Quiz',
      model: 'UpdateQuiz',
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.updateQuiz,
  },
  {
    path: '/api/quiz',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
        // admin: JOI.boolean().default(false),
      }).unknown(),
      query: {
        skip: JOI.number(),
        limit: JOI.number(),
        searchString: JOI.string(),
      },
      group: 'QUIZ',
      description: 'Api to get Quiz List',
      model: 'GetQuiz',
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.getQuiz,
  },
  {
    path: '/api/quiz/:id',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
        // admin: JOI.boolean().default(false),
      }).unknown(),
      params: JOI.object({
        id: routeUtils.validation.mongooseId,
      }),
      group: 'QUIZ',
      description: 'Api to get Quiz by ID',
      model: 'GetQuiz',
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.getQuizById,
  },
  // {
  //   path: `/api/${MODULE.name}/play/:product_id`,
  //   method: 'GET',
  //   joiSchemaForSwagger: {
  //     headers: JOI.object({
  //       authorization: JOI.string().required(),
  //     }).unknown(),
  //     params: JOI.object({
  //       product_id: routeUtils.validation.mongooseId,
  //     }),
  //     group: `${MODULE.group}`,
  //     description: 'Api to get Quiz data to play',
  //     model: 'GetQuizToPlay',
  //   },
  //   auth: [USER_ROLE.STUDENT],
  //   handler: quizController.getDataToPlay,
  // },
  // {
  //   path: '/api/quiz/:id',
  //   method: 'DELETE',
  //   joiSchemaForSwagger: {
  //     headers: JOI.object({
  //       authorization: JOI.string().required(),
  //     }).unknown(),
  //     params: JOI.object({
  //       quizId: routeUtils.validation.mongooseId,
  //     }),
  //     group: 'QUIZ',
  //     description: 'Api to delete Quiz',
  //     model: 'DeleteQuiz',
  //   },
  //   auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
  //   handler: quizController.deleteQuiz,
  // },
  // {
  //   path: `/api/flushCache/${MODULE.name}`,
  //   method: 'GET',
  //   joiSchemaForSwagger: {
  //     headers: JOI.object({
  //       authorization: JOI.string().required(),
  //     }).unknown(),
  //     query: JOI.object({
  //       id: JOI.string(),
  //     }),
  //     group: `${MODULE.group}`,
  //     description: 'Api to flush all Quiz from Cache',
  //     model: 'FlushQuizCache',
  //   },
  //   auth: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
  //   handler: quizController.flushCache,
  // },
];
module.exports = routes;
