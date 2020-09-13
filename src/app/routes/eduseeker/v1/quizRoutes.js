
const JOI = require('joi');
const { USER_ROLE, DEFAULT } = require('../../../utils/constants');
const { quizController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');
const { Router } = require('express');
const CONSTANTS = require('../../../utils/constants');

let MODULE = {
  name: 'quiz',
  group: 'Quiz'
}
const routes = [
  {
    path: `/api/${MODULE.name}`,
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      body:{
        title: JOI.string().required(),
        subjectId: routeUtils.validation.mongooseId,
        imageURL: JOI.string(),
        isPaid:JOI.boolean().required(),
        amount:JOI.number(),
        headline:JOI.string(),
        difficultLevel:JOI.string().valid(Object.values(CONSTANTS.DIFFICULT_LEVEL)),
        questionList:JOI.array().items(routeUtils.validation.mongooseId),
        attemptTime:JOI.number().required(),
        // description:JOI.string().required(),
        // requirements:JOI.string(),
        benefits:JOI.array().items(JOI.string())
      },
      group: `${MODULE.group}`,
      description: 'Api to create Quiz',
      model: 'CreateQuiz'
    },
    auth:[USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.createQuiz
  },
  {
    path: `/api/${MODULE.name}/:quizId`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params:{
        quizId: routeUtils.validation.mongooseId.required()
      },
      body:{
        title: JOI.string(),
        subjectId: routeUtils.validation.mongooseId,
        imageURL: JOI.string(),
        isPaid:JOI.boolean(),
        amount:JOI.number(),
        headline:JOI.string(),
        difficultLevel:JOI.string().valid(Object.values(CONSTANTS.DIFFICULT_LEVEL)),
        questionList:JOI.array().items(routeUtils.validation.mongooseId),
        attemptTime:JOI.number(),
        benefits:JOI.array().items(JOI.string())
      },
      group: `${MODULE.group}`,
      description: 'Api to create Quiz',
      model: 'CreateQuiz'
    },
    auth:[USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.upldateQuiz
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
    // auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.findResource
  },
  {
    path: `/api/${MODULE.name}/enrolled`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      group: `${MODULE.group}`,
      description: 'Api to get Quiz List',
      model: 'GetEnrolledQuiz'
    },
    auth: [USER_ROLE.STUDENT],
    handler: quizController.getEnrolledQuiz
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
  },
  {
    path: `/api/${MODULE.name}/:quizId`,
    method: 'DELETE',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: JOI.object({
        quizId: routeUtils.validation.mongooseId
      }),
      group: `${MODULE.group}`,
      description: 'Api to delete Quiz',
      model: 'DeleteQuiz'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: quizController.deleteQuiz
  }
]
module.exports = routes;