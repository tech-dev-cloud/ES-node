const Joi = require('joi');
const routeUtils = require('../../utils/routeUtils');
const { USER_ROLE } = require('../../utils/constants');
const { subjectController } = require('./subject-controller');
module.exports = [
  {
    method: 'POST',
    path: '/topic',
    joiSchemaForSwagger: {
      body: {
        subjectId: routeUtils.validation.mongooseId,
        moduleId: routeUtils.validation.mongooseId,
        name: Joi.string().required(),
      },
      group: 'Subjects',
      description: 'Api to Add topic',
      model: 'CreateTopic',
    },
    version: 'v1',
    auth: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
    handler: subjectController.createTopic,
  },
  {
    method: 'PUT',
    path: '/topic/:topicId',
    joiSchemaForSwagger: {
      params: {
        topicId: routeUtils.validation.mongooseId,
      },
      body: {
        subjectId: routeUtils.validation.mongooseId,
        moduleId: routeUtils.validation.mongooseId,
        name: Joi.string().required(),
      },
      group: 'Subjects',
      description: 'Api to update topic',
      model: 'UpdateTopic',
    },
    version: 'v1',
    auth: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
    handler: subjectController.updateTopic,
  },
  {
    method: 'DELETE',
    path: '/topic/:topicId',
    joiSchemaForSwagger: {
      params: {
        topicId: routeUtils.validation.mongooseId,
      },
      group: 'Subjects',
      description: 'Api to delete topic',
      model: 'DeleteTopic',
    },
    version: 'v1',
    auth: [USER_ROLE.ADMIN],
    handler: subjectController.deleteTopic,
  },
];
