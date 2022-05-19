const JOI = require('joi');
const {
  MODULES,
  EMAIL_TYPE,
  USER_GROUP,
  USER_ROLE,
} = require('../../utils/constants');
const routeUtils = require('../../utils/routeUtils');
const {
  stayTuned,
  createTemplate,
  sendEmailNotification,
  getTemplates,
  getTemplateById,
  updateTemplate,
  tempEmail,
} = require('./notification-controller');

module.exports = [
  {
    path: '/api/stay-tuned',
    method: 'POST',
    joiSchemaForSwagger: {
      body: JOI.object({
        name: JOI.string().required(),
        email: JOI.string().email().required(),
      }),
      group: MODULES.notification,
      description: 'Api to subscribe for Updates',
      model: 'SubscribeForNewUpdates',
    },
    handler: stayTuned,
  },
  {
    path: '/api/notification-template',
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      body: JOI.object({
        title: JOI.string().required(),
        subject: JOI.string().required(),
        type: JOI.string().valid(Object.values(EMAIL_TYPE)),
        userGroup: JOI.string().valid(Object.values(USER_GROUP)),
        template: JOI.string().required(),
        status: JOI.boolean(),
      }),
      group: MODULES.notification,
      description: 'Api to add notification template',
      model: 'AddNotificationTemplate',
    },
    auth: [USER_ROLE.TEACHER],
    handler: createTemplate,
  },
  {
    path: '/api/notification-template',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      query: JOI.object({
        type: JOI.string().valid(Object.values(EMAIL_TYPE)),
        userGroup: JOI.string().valid(Object.values(USER_GROUP)),
        status: JOI.boolean(),
        searchString: JOI.string(),
        index: JOI.number().min(0).default(0),
        limit: JOI.number().min(20).default(20),
      }),
      group: MODULES.notification,
      description: 'Api to get notification templates',
      model: 'GetNotificationTemplate',
    },
    auth: [USER_ROLE.TEACHER],
    handler: getTemplates,
  },
  {
    path: '/api/notification-template/:templateId',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: {
        templateId: routeUtils.validation.mongooseId.required(),
      },
      group: MODULES.notification,
      description: 'Api to get notification template by id',
      model: 'getTemplateById',
    },
    auth: [USER_ROLE.TEACHER],
    handler: getTemplateById,
  },
  {
    path: '/api/notification-template/:templateId',
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: JOI.object({
        templateId: routeUtils.validation.mongooseId.required(),
      }),
      body: JOI.object({
        title: JOI.string(),
        subject: JOI.string(),
        type: JOI.string().valid(Object.values(EMAIL_TYPE)),
        userGroup: JOI.string().valid(Object.values(USER_GROUP)),
        template: JOI.string(),
        status: JOI.boolean(),
      }),
      group: MODULES.notification,
      description: 'Api to Add notification template',
      model: 'CreateNotificationTemplate',
    },
    auth: [USER_ROLE.TEACHER],
    handler: createTemplate,
  },
  {
    path: '/api/notification-template/:templateId',
    method: 'PUT',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: JOI.object({
        templateId: routeUtils.validation.mongooseId.required(),
      }),
      body: JOI.object({
        title: JOI.string(),
        subject: JOI.string(),
        type: JOI.string().valid(Object.values(EMAIL_TYPE)),
        userGroup: JOI.string().valid(Object.values(USER_GROUP)),
        template: JOI.string(),
        status: JOI.boolean(),
      }),
      group: MODULES.notification,
      description: 'Api to update notification template',
      model: 'UpdateNotificationTemplate',
    },
    auth: [USER_ROLE.TEACHER],
    handler: updateTemplate,
  },
  {
    path: '/api/send-notification/:templateId',
    method: 'POST',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      params: JOI.object({
        templateId: routeUtils.validation.mongooseId.required(),
      }),
      group: MODULES.notification,
      description: 'Api to send email notification',
      model: 'SendNotification',
    },
    auth: [USER_ROLE.TEACHER],
    handler: sendEmailNotification,
  },
  {
    path: '/api/temp-email',
    method: 'POST',
    joiSchemaForSwagger: {
      group: MODULES.notification,
      description: 'Api to send email notification',
      model: 'TempEmail',
    },
    handler: tempEmail,
  },
];
