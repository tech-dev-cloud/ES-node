'use strict';

const Joi = require('joi');
const { USER_ROLE } = require('../../utils/constants');
const routeUtils = require('../../utils/routeUtils');
const { taxonomy } = require('../../modules/category/controller');

const routes = [
  {
    method: 'POST',
    path: '/api/category',
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).unknown(),
      body: {
        term: Joi.string().required(),
        parent_id: routeUtils.validation.mongooseId,
      },
      group: 'Terms',
      description: 'Api to add new Terms',
      model: 'CreateTerms',
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: taxonomy.addNewCategory,
  },
  // {
  //   method: 'GET',
  //   path: '/api/categories',
  //   joiSchemaForSwagger: {
  //     headers: Joi.object({
  //       authorization: Joi.string().required(),
  //     }).unknown(),
  //     query: {
  //       parent_id: routeUtils.validation.mongooseId,
  //       index: Joi.number().default(0),
  //     },
  //     group: 'Terms',
  //     description: 'Api to add new Terms',
  //     model: 'GetTerms',
  //   },
  //   auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
  //   handler: taxonomy.getCategories,
  // },
];
module.exports = routes;
