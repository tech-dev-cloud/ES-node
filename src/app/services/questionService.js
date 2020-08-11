let { QuestionModel } = require('../models');
const { MONGO_ERROR, ERROR_TYPE, DEFAULT } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const dbUtils = require('../utils/utils');
const responseHelper = require('../utils/responseHelper');
let service = {};

/**Function to save Question in DB */
service.createResource = async (payload) => {
  // const exist = await QuestionModel.findOne({ createdBy: payload.user.userId, question: payload.question }).lean();
  // if (exist) {
  //   throw responseHelper.createErrorResponse(MESSAGES.QUESTION.DUPLICATE, ERROR_TYPE.BAD_REQUEST);
  // }
  payload.createdBy = payload.user.userId;
  const question = new QuestionModel(payload);
  return await question.save();
}

/** Function to update Question */
service.updateResource = async (payload) => {
  const exist = await QuestionModel.findById(payload.questionID).lean();
  if (!exist) {
    throw responseHelper.createErrorResponse(MESSAGES.QUESTION.NOT_FOUND, ERROR_TYPE.BAD_REQUEST);
  }
  if (exist.createdBy != payload.user.userId) {
    throw responseHelper.createErrorResponse(MESSAGES.USER.UNAUTHORIZED, ERROR_TYPE.UNAUTHORIZED);
  }
  return await QuestionModel.updateOne({ _id: payload.questionID }, payload);
}

/** Function to get questions */
service.findResource = async (payload) => {
  let match = { createdBy: payload.user.userId };
  let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
  let topicLookup = { from: 'topics', localField: 'topicId', foreignField: '_id', as: 'topicData' };
  let skip = (payload.index || DEFAULT.INDEX) * (payload.limit || DEFAULT.LIMIT);
  let limit = payload.limit || DEFAULT.LIMIT;

  let query = [
    { $match: {} },
    { $lookup: subjectLookup },
    { $unwind: `$${subjectLookup.as}` },
    // { $lookup: topicLookup },
    // { $unwind: `$${topicLookup.as}` },
    {
      $group: {
        _id: null,
        totalCounts: { $sum: 1 },
        items: { $push: "$$ROOT" }
      }
    },
    { $addFields: { items: { $slice: ['$items', skip, limit] } } }
  ];
  return (await QuestionModel.aggregate(query))[0] || { totalCounts: 0, items: [] };
}

/** Function to get question by ID */
service.findResourceByID = async (payload) => {
  let match = { _id: payload.questionID, createdBy: payload.user.userId };
  let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
  let topicLookup = { from: 'topics', localField: 'topicId', foreignField: '_id', as: 'topicData' };

  let query = [
    { $match: match },
    { $lookup: subjectLookup },
    { $unwind: `$${subjectLookup.as}` },
    { $lookup: topicLookup },
    { $unwind: `$${topicLookup.as}` },
  ];
  const data = (await QuestionModel.aggregate(query))[0];
  if (!data) {
    throw responseHelper.createErrorResponse(MESSAGES.QUESTION.NOT_FOUND, ERROR_TYPE.BAD_REQUEST);
  }
  return data;
}

/** Function to delete question */
service.deleteResource = async (payload) => {
  const question = await QuestionModel.findById(payload.questionID).lean();
  if (!question) {
    throw responseHelper.createErrorResponse(MESSAGES.QUESTION.NOT_FOUND, ERROR_TYPE.BAD_REQUEST);
  }
  if (question.createdBy != payload.user.userId) {
    throw responseHelper.createErrorResponse(MESSAGES.USER.UNAUTHORIZED, ERROR_TYPE.UNAUTHORIZED);
  }
  if (!payload.hardDelete) {
    return await QuestionModel.findByIdAndUpdate(payload.questionID, { isDeleted: true }).lean();
  }
  return await QuestionModel.deleteOne({ _id: payload.questionID });
}

module.exports = { questionService: service }