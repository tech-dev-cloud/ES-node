'use strict';

const Joi = require('joi');
const { USER_ROLE } = require('../../utils/constants');
const { subjectController } = require('../../controllers');
const routeUtils = require('../../utils/routeUtils');

const MODULE = {
  name: 'subject'
}
// options({ allowUnknown: true })
let routes = [
  {
    method: 'POST',
    path: `/api/${MODULE.name}`,
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).unknown(),
      body: {
        name: Joi.string().required(),
        status: Joi.boolean()
      },
      group: 'Subjects',
      description: 'Api to add new Subject',
      model: 'CreateSubject'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: subjectController.createSubject
  },
  {
    method: 'GET',
    path: `/api/${MODULE.name}`,
    joiSchemaForSwagger: {
      query: {
        status: Joi.boolean().optional().description('get search deleted options'),
      },
      group: 'Subjects',
      description: 'Api to get Subjects',
      model: 'GetSubjects'
    },
    handler: subjectController.getAllSubjects
  },
  {
    method: 'GET',
    path: `/api/${MODULE.name}/:id`,
    joiSchemaForSwagger: {
      params: {
        id: routeUtils.validation.mongooseId
      },
      group: 'Subjects',
      description: 'Api to get Subject by ID',
      model: 'Get_Subject_By_ID'
    },
    // auth: CONSTANTS.AVAILABLE_AUTH.ADMIN,
    handler: subjectController.getSubjectById
  },
  {
    method: 'PUT',
    path: `/api/${MODULE.name}/:id`,
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId
      },
      group: 'Subjects',
      description: 'Api to update Subject',
      model: 'UpdateSuabject'
    },
    auth: [USER_ROLE.ADMIN],
    handler: subjectController.updateSubject
  },
  // {
  //   method: 'DELETE',
  //   path: `/api/${MODULE.name}/:id`,
  //   joiSchemaForSwagger: {
  //     headers: Joi.object({
  //       authorization: Joi.string().required()
  //     }).options({ allowUnknown: true }),
  //     params: {
  //       id: routeUtils.validation.mongooseId
  //     },
  //     group: 'Subjects',
  //     description: 'Api to delete Subject',
  //     model: 'Delete_Subject'
  //   },
  //   auth: [USER_ROLE.ADMIN],
  //   handler: subjectController.deleteResource
  // }
]
module.exports = routes;