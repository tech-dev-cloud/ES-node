'use strict';

const Joi = require('joi');
const { USER_ROLE } = require('../../../utils/constants');
const { unitController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

const MODULE = {
  name: 'unit',
  modelName: 'Unit'
}
let routes = [
  {
    method: 'POST',
    path: `/api/${MODULE.name}`,
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).unknown(),
      body: {
        subjectId: routeUtils.validation.mongooseId,
        number: Joi.number().required(),
        name: Joi.string().required(),
        status: Joi.boolean()
      },
      group: `${MODULE.modelName}`,
      description: 'Api to add new Unit',
      model: 'CreateUnit'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: unitController.createResource
  },
  {
    method: 'GET',
    path: `/api/${MODULE.name}`,
    joiSchemaForSwagger: {
      query: {
        status: Joi.boolean().optional().description('get search deleted options'),
      },
      group: `${MODULE.modelName}`,
      description: 'Api to get Unit',
      model: 'GetUnit'
    },
    handler: unitController.findResource
  },
  {
    method: 'GET',
    path: `/api/${MODULE.name}/:id`,
    joiSchemaForSwagger: {
      params: {
        id: routeUtils.validation.mongooseId
      },
      group: `${MODULE.modelName}`,
      description: 'Api to get Unit by ID',
      model: 'Get_Unit_By_ID'
    },
    // auth: CONSTANTS.AVAILABLE_AUTH.ADMIN,
    handler: unitController.findResourceyID
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
      group: `${MODULE.modelName}`,
      description: 'Api to update Unit',
      model: 'UpdateUnit'
    },
    auth: [USER_ROLE.ADMIN],
    handler: unitController.updateResource
  },
  {
    method: 'DELETE',
    path: `/api/${MODULE.name}/:id`,
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true }),
      params: {
        id: routeUtils.validation.mongooseId
      },
      group: `${MODULE.modelName}`,
      description: 'Api to delete Unit',
      model: 'Delete_Unit'
    },
    auth: [USER_ROLE.ADMIN],
    handler: unitController.deleteResource
  }
]
module.exports = routes;