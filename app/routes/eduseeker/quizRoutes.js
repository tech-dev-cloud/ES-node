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
        topicId: routeUtils.validation.mongooseId,
        moduleId: routeUtils.validation.mongooseId,
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
        topicId: routeUtils.validation.mongooseId,
        moduleId: routeUtils.validation.mongooseId,
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
      }).unknown(),
      query: {
        page: JOI.number().required(),
        limit: JOI.number().required(),
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
  {
    path: '/api/quiz/play/:product_id',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: JOI.object({
        product_id: routeUtils.validation.mongooseId,
      }),
      query: {
        type: JOI.string().valid(['quiz', 'product']),
        resume_doc_id: routeUtils.validation.mongooseId,
      },
      group: 'QUIZ',
      description: 'Api to get Quiz data to play',
      model: 'GetQuizToPlay',
    },
    auth: [USER_ROLE.STUDENT],
    handler: quizController.getDataToPlay,
  },
  {
    path: '/api/quiz/result/:docId',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: JOI.object({
        docId: routeUtils.validation.mongooseId,
      }),
      query: {
        type: JOI.string().valid(['quiz', 'product']),
      },
      group: 'QUIZ',
      description: 'Api get quiz result',
      model: 'GetQuizResult',
    },
    auth: [USER_ROLE.STUDENT],
    handler: quizController.getQuizResult,
  },
  {
    path: '/api/leaderboard/:quizID',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: JOI.object({
        quizID: routeUtils.validation.mongooseId,
      }),
      group: 'QUIZ',
      description: 'Api get quiz result',
      model: 'GetQuizResult',
    },
    auth: [USER_ROLE.STUDENT],
    handler: quizController.getLeaderBoard,
  },
];
module.exports = routes;
