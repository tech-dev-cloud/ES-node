const { MONGO_ERROR } = require('../../utils/constants');
const errorCodes = require('../../utils/errorCodes');
const responseHelper = require('../../utils/responseHelper');
const {
  successFullySubscribed,
  addNewTemplate,
  emailNotificationSent,
  fetchTemplates,
} = require('../../utils/successCodes');
const service = require('./notification-service');
module.exports = {
  stayTuned: async (request, response) => {
    const data = request.body;
    try {
      await service.addNewSubscriber(data);
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
    await service.addNewTemplate(data);
    response.status(200).json(responseHelper.success(addNewTemplate));
  },
  updateTemplate: async (request, response) => {
    const data = request.body;
    await service.updateNewTemplate(request.params.templateId, data);
    response.status(200).json(responseHelper.success(addNewTemplate));
  },
  sendEmailNotification: async (request, response) => {
    const templateId = request.params.templateId;
    service.sendEmailNtification(templateId);
    response.status(200).json(responseHelper.success(emailNotificationSent));
  },
  getTemplates: async (request, response) => {
    const query = request.query;
    const data = await service.getTemplates(query);
    response.status(200).json(responseHelper.success(fetchTemplates, data));
  },
  getTemplateById: async (request, response) => {
    const template = await service.getTemplateById(request.params.templateId);
    response.status(200).json(responseHelper.success(fetchTemplates, template));
  },
  tempEmail: async (request, response) => {
    service.tempEmail();
    response.status(200).json(responseHelper.success(emailNotificationSent));
  },
};
