const JOI = require('joi');
const { USER_ROLE, DEFAULT,DB } = require('../../../utils/constants');
const { questionController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

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
        // topicId: routeUtils.validation.mongooseId,
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
    handler: questionController.createResource
  },
  {
    path: `/api/${MODULE.name}/:questionID`,
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        questionID: routeUtils.validation.mongooseId
      },
      body: {
        subjectId: routeUtils.validation.mongooseId,
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
    auth: [USER_ROLE.TEACHER],
    handler: questionController.updateResource
  },
  {
    path: `/api/${MODULE.name}`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      query: {
        subjectId:routeUtils.validation.mongooseId.required(),
        index: JOI.number().default(DEFAULT.INDEX).min(DEFAULT.INDEX),
        limit: JOI.number().min(DEFAULT.LIMIT).min(0)
      },
      group: 'Question',
      description: 'Api to get questions',
      model: 'GetQuestion'
    },
    auth: [USER_ROLE.TEACHER],
    handler: questionController.findResource
  },
  {
    path: `/api/${MODULE.name}/:questionID`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        questionID: routeUtils.validation.mongooseId
      },
      group: 'Question',
      description: 'Api to get questions By ID',
      model: 'GetQuestionByID'
    },
    auth: [USER_ROLE.TEACHER],
    handler: questionController.findResourceByID
  },
  {
    path: `/api/${MODULE.name}/:questionID`,
    method: 'DELETE',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      params: {
        questionID: routeUtils.validation.mongooseId
      },
      group: 'Question',
      description: 'Api to get questions By ID',
      model: 'DeleteQuestionByID'
    },
    auth: [USER_ROLE.TEACHER],
    handler: questionController.deleteResource
  },

]

module.exports = routes;