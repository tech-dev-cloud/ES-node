const JOI = require('joi');
const { USER_ROLE, DEFAULT,DB } = require('../../utils/constants');
const { questionController } = require('../../controllers');
const routeUtils = require('../../utils/routeUtils');

const MODULE = {
  name: 'question'
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
        subjectId: routeUtils.validation.mongooseId,
        moduleId: routeUtils.validation.mongooseId,
        type:JOI.number().valid(Object.values(DB.QUESTION_TYPE)),
        image:JOI.string(),
        question: JOI.string().required(),
        options: JOI.array().items(JOI.string().required()),
        correctOption: JOI.array().items(JOI.number().required()),
        description: JOI.string()
      },
      group: 'Question',
      description: 'Api to create question',
      model: 'CreateQuestion'
    },
    auth: [USER_ROLE.TEACHER],
    handler: questionController.createQuestion
  },
  {
    path: `/api/${MODULE.name}/:id`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId
      },
      body: {
        subjectId: routeUtils.validation.mongooseId,
        moduleId: routeUtils.validation.mongooseId,
        type:JOI.number().valid(Object.values(DB.QUESTION_TYPE)),
        image:JOI.string(),
        question: JOI.string(),
        options: JOI.array().items(JOI.string()),
        correctOption: JOI.array().items(JOI.number()),
        description: JOI.string()
      },
      group: 'Question',
      description: 'Api to update question',
      model: 'UpdateQuestion'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: questionController.updateQuestion
  },
  {
    path: `/api/question`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      query: {
        subjectId:routeUtils.validation.mongooseId.required(),
        moduleId:routeUtils.validation.mongooseId,
        index: JOI.number().default(DEFAULT.INDEX).min(DEFAULT.INDEX),
        limit: JOI.number().min(DEFAULT.LIMIT).min(0)
      },
      group: 'Question',
      description: 'Api to get questions',
      model: 'GetQuestion'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: questionController.getQuestions
  },
  {
    path: `/api/question/:id`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId
      },
      group: 'Question',
      description: 'Api to get questions By ID',
      model: 'GetQuestionByID'
    },
    auth: [USER_ROLE.TEACHER],
    handler: questionController.getQuestionById
  },
  {
    path: `/api/question/:id`,
    method: 'DELETE',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId
      },
      group: 'Question',
      description: 'Api to delete question By ID',
      model: 'DeleteQuestionByID'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: questionController.deleteQuestion
  },

]

module.exports = routes;