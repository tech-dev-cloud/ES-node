
const JOI = require('joi');
const { USER_ROLE, DEFAULT } = require('../../../utils/constants');
const { quizController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');
const { Router } = require('express');

let MODULE = {
  name: 'quiz',
  group: 'Quiz'
}
const routes = [
  {
    path: `/api/${MODULE.name}`,
    method: 'POST',
    joiSchemaForSwagger: {
      body:{
        title: JOI.string().required(),
        subjectId: routeUtils.validation.mongooseId,
        imageURL: JOI.string(),
        isPaid:JOI.boolean().required(),
        amount:JOI.number().required(),
        instructor:routeUtils.validation.mongooseId,
        headline:JOI.string(),
        questionList:JOI.array().items(routeUtils.validation.mongooseId),
        attemptTime:JOI.number().required(),
        description:JOI.string(),
        requirements:JOI.string(),
        objectivesSummary:JOI.string()
      },
      group: `${MODULE.group}`,
      description: 'Api to create Quiz',
      model: 'CreateQuiz'
    },
    auth:[USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.createQuiz
  },
  {
    path: `/api/${MODULE.name}`,
    method: 'GET',
    joiSchemaForSwagger: {
      query: {
        index: JOI.number().default(DEFAULT.INDEX).min(DEFAULT.INDEX),
        limit: JOI.number().min(DEFAULT.LIMIT).min(0)
      },
      group: `${MODULE.group}`,
      description: 'Api to get Quiz List',
      model: 'GetQuiz'
    },
    handler: quizController.findResource
  },
  {
    path: `/api/${MODULE.name}/:quizId`,
    method: 'GET',
    joiSchemaForSwagger: {
      params: JOI.object({
        quizId: routeUtils.validation.mongooseId
      }),
      group: `${MODULE.group}`,
      description: 'Api to get Quiz List',
      model: 'GetQuiz'
    },
    handler: quizController.findResourceById
  }, {
    path: `/api/${MODULE.name}/:quizId`,
    method: 'GET',
    joiSchemaForSwagger: {
      params: JOI.object({
        quizId: routeUtils.validation.mongooseId
      }),
      group: `${MODULE.group}`,
      description: 'Api to get Quiz List',
      model: 'GetQuiz'
    },
    handler: quizController.findResourceById
  },
  {
    path: `/api/${MODULE.name}/play/:quizId`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: JOI.object({
        quizId: routeUtils.validation.mongooseId
      }),
      group: `${MODULE.group}`,
      description: 'Api to get Quiz data to play',
      model: 'GetQuizToPlay'
    },
    auth: [USER_ROLE.STUDENT],
    handler: quizController.getDataToPlay
  }
]
module.exports = routes;