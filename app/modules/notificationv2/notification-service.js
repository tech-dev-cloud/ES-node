const Logger = require('../../../config/winston');
const { Subscriber, Template, UserModel } = require('../../mongo-models');
const { USER_GROUP } = require('../../utils/constants');
const WebPush = require('../../utils/webpush');
const Email = require('./email-service');
const SUBSCRIBERS = require('../notification/in-memory');
const service = {
  addNewSubscriber: async (userData) => {
    const data = new Subscriber(userData);
    return data.save();
  },
  addNewTemplate: async (templateData) => {
    const data = new Template(templateData);
    return data.save();
  },
  updateNewTemplate: async (templateId, dataToUpdate) => {
    return Template.updateOne({ _id: templateId }, dataToUpdate);
  },
  sendEmailNtification: async (templateId) => {
    const templateObject = await Template.findOne({
      _id: templateId,
      status: true,
    }).lean();
    const users = await service.getUserGroup(templateObject.userGroup);
    const emailObj = new Email(templateObject);
    for (const user of users) {
      emailObj.mapKeys(user);
      emailObj
        .sendEmail(user.email)
        .then((res) => {})
        .catch((err) => {
          Logger.error(err);
        });
    }
  },
  tempEmail: async () => {
    const emailObj = new Email();
    emailObj.publishThankyouNotification('damandeeps16@gmail.com');
  },
  getUserGroup: async (userGroup) => {
    let users;
    switch (userGroup) {
      case USER_GROUP.subscribers:
        users = await Subscriber.find({}, { email: 1, name: 1 }).lean();
        break;
      case USER_GROUP.registerd:
        users = await UserModel.find({}, { email: 1, name: 1 }).lean();
        break;
      default:
        const data = await Promise.all([
          Subscriber.find({ status: true }, { email: 1, name: 1 }).lean(),
          UserModel.find({}, { email: 1 }).lean(),
        ]);
        users = [...data[0], data[1]];
        break;
    }
    return users;
  },
  getTemplates: async (query) => {
    const match = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.userGroup ? { userGroup: query.userGroup } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    if (query.searchString) {
      match['$text'] = { $search: request.query.searchString };
    }
    return Template.find(match);
  },
  getTemplateById: async (templateId) => {
    return Template.findOne({ _id: templateId }).lean();
  },
};
module.exports = service;
