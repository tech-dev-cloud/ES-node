const Mongoose = require('mongoose');
const { MONGO_ERROR } = require('../../utils/constants');
const errorCodes = require('../../utils/errorCodes');
const responseHelper = require('../../utils/responseHelper');
const {
  successFullySubscribed,
  addNewTemplate,
  emailNotificationSent,
  fetchTemplates,
  getNotifications,
  success,
} = require('../../utils/successCodes');
const notificationService = require('./notification-service');
module.exports = {
  stayTuned: async (request, response) => {
    const data = request.body;
    try {
      await notificationService.addNewSubscriber(data);
      response.status(200).json(responseHelper.success(successFullySubscribed));
    } catch (err) {
      if (err.code == MONGO_ERROR.DUPLICATE) {
        response
          .status(400)
          .json(
            responseHelper.error.BAD_REQUEST(errorCodes.ALREADY_SUBSCRIBED)
          );
      }
    }
  },
  createTemplate: async (request, response) => {
    const data = request.body;
    await notificationService.addNewTemplate(data);
    response.status(200).json(responseHelper.success(addNewTemplate));
  },
  updateTemplate: async (request, response) => {
    const data = request.body;
    await notificationService.updateNewTemplate(request.params.templateId, data);
    response.status(200).json(responseHelper.success(addNewTemplate));
  },
  sendEmailNotification: async (request, response) => {
    const templateId = request.params.templateId;
    notificationService.sendEmailNtification(templateId);
    response.status(200).json(responseHelper.success(emailNotificationSent));
  },
  getTemplates: async (request, response) => {
    const query = request.query;
    const data = await notificationService.getTemplates(query);
    response.status(200).json(responseHelper.success(fetchTemplates, data));
  },
  getTemplateById: async (request, response) => {
    const template = await notificationService.getTemplateById(request.params.templateId);
    response.status(200).json(responseHelper.success(fetchTemplates, template));
  },
  tempEmail: async (request, response) => {
    notificationService.tempEmail();
    response.status(200).json(responseHelper.success(emailNotificationSent));
  },
  addNotificationSubscriber: async (request, response) => {
    notificationService.addNotificationSubscriber(request.body);
    response.status(200).json(responseHelper.success(emailNotificationSent));
  },
  sendNotification: (request, response) => {
    notificationService.sendNotification(request.body);
    response.status(200).json(responseHelper.success(emailNotificationSent));
  },
  getUserNotification: async (request, response)=>{
    let {limit, lastId, unseen} = request.query;
    unseen = unseen==='true';
    limit = parseInt(limit);
    lastId = Mongoose.Types.ObjectId(lastId);
    const user =request.user;
    const data = await notificationService.getUserNotification(limit, lastId, unseen, user);
    response.status(200).json(responseHelper.success(getNotifications, data));
  },

  updateUserNotification: async (request, response)=>{
    const {notificationId}=request.params;
    const user =request.user;
    const data = await notificationService.updateUserNotification(notificationId, user);
    response.status(200).json(responseHelper.success(success, data));
  }
};
