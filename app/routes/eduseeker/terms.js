'use strict';

const Joi = require('joi');
const { USER_ROLE } = require('../../utils/constants');
const { termController } = require('../../controllers');
const routeUtils = require('../../utils/routeUtils');

let routes = [
  {
    method: 'POST',
    path: `/api/terms`,
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).unknown(),
      body: {
        term: Joi.string().required(),
        parent_id: routeUtils.validation.mongooseId
      },
      group: 'Terms',
      description: 'Api to add new Terms',
      model: 'CreateTerms'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: termController.createTerm
  },
  {
    method: 'GET',
    path: `/api/terms`,
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).unknown(),
      query: {
        parent_id: routeUtils.validation.mongooseId,
        index: Joi.number().default(0)
      },
      group: 'Terms',
      description: 'Api to add new Terms',
      model: 'GetTerms'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: termController.getTerms
  }
]
module.exports = routes