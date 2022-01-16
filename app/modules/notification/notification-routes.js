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
      description: 'Api to update notification template',
      model: 'UpdateNotificationTemplate',
    },
    auth: [USER_ROLE.TEACHER],
    handler: createTemplate,
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
];
