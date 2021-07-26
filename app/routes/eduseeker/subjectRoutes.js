'use strict';

const JOI = require('joi');
const { USER_ROLE } = require('../../utils/constants');
const { subjectController } = require('../../controllers');
const routeUtils = require('../../utils/routeUtils');

// options({ allowUnknown: true })
const routes = [
  {
    method: 'POST',
    path: '/api/subject',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      body: {
        name: JOI.string().required(),
        status: JOI.boolean(),
        modules: JOI.array().items(
          JOI.object({
            name: JOI.string(),
            topics: JOI.array().items(
              JOI.object({
                name: JOI.string(),
              })
            ),
          })
        ),
      },
      group: 'Subjects',
      description: 'Api to add new Subject',
      model: 'CreateSubject',
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
    handler: subjectController.createSubject,
  },
  {
    method: 'GET',
    path: '/api/subject',
    joiSchemaForSwagger: {
      query: {
        status: JOI.boolean()
          .optional()
          .description('get search deleted options'),
      },
      group: 'Subjects',
      description: 'Api to get Subjects',
      model: 'GetSubjects',
    },
    handler: subjectController.getAllSubjects,
  },
  {
    method: 'GET',
    path: '/api/subject/:id',
    joiSchemaForSwagger: {
      params: {
        id: routeUtils.validation.mongooseId,
      },
      group: 'Subjects',
      description: 'Api to get Subject by ID',
      model: 'Get_Subject_By_ID',
    },
    // auth: CONSTANTS.AVAILABLE_AUTH.ADMIN,
    handler: subjectController.getSubjectById,
  },
  {
    method: 'PUT',
    path: '/api/subject/:id',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: {
        id: routeUtils.validation.mongooseId,
      },
      group: 'Subjects',
      description: 'Api to update Subject',
      model: 'UpdateSuabject',
    },
    auth: [USER_ROLE.ADMIN],
    handler: subjectController.updateSubject,
  },
  // {
  //   method: 'DELETE',
  //   path: `'/api/subject'/:id`,
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
];
module.exports = routes;
