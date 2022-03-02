let { QuestionModel } = require('../mongo-models');
const { MONGO_ERROR, ERROR_TYPE, DEFAULT } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const dbUtils = require('../utils/utils');
const responseHelper = require('../utils/responseHelper');
let service = {};

/**Function to save Question in DB */
service.createResource = async (payload) => {
  payload.createdBy = payload.user.userId;
  const question = new QuestionModel(payload);
  return await question.save();
}

/** Function to update Question */
service.updateResource = async (payload) => {
  const exist = await QuestionModel.findById(payload.questionID).lean();
  if (!exist) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.QUESTION.NOT_FOUND);
  }
  // if (exist.createdBy.toString() != payload.user.userId.toString()) {
  //   throw responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED, MESSAGES.USER.UNAUTHORIZED);
  // }
  return await QuestionModel.updateOne({ _id: payload.questionID }, payload);
}

/** Function to get questions */
service.findResource = async (payload) => {
  let match = { subjectId: payload.subjectId, isDeleted: false };
  let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
  let moduleLookup = { from: 'modules', localField: 'moduleId', foreignField: '_id', as: 'module' };
  let skip = (payload.index || DEFAULT.INDEX) * (payload.limit || DEFAULT.LIMIT);
  let limit = payload.limit || DEFAULT.LIMIT;

  let query = [
    { $match: match },
    { $lookup: subjectLookup },
    { $unwind: `$${subjectLookup.as}` },
    // { $lookup: moduleLookup },
    // { $unwind: `$${moduleLookup.as}` },
    {
      $group: {
        _id: null,
        totalCounts: { $sum: 1 },
        items: { $push: "$$ROOT" }
      }
    },
    { $addFields: { items: '$items' } }
    // { $addFields: { items: { $slice: ['$items', skip, limit] } } }
  ];
  return (await QuestionModel.aggregate(query))[0] || { totalCounts: 0, items: [] };
}

/** Function to get question by ID */
service.findResourceByID = async (payload) => {
  let match = { _id: payload.questionID };
  let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
  let moduleLookup = { from: 'modules', localField: 'moduleId', foreignField: '_id', as: 'module' };

  let query = [
    { $match: match },
    { $lookup: subjectLookup },
    { $unwind: `$${subjectLookup.as}` },
    { $lookup: moduleLookup },
    { $unwind: `$${moduleLookup.as}` },
  ];
  const data = (await QuestionModel.aggregate(query))[0];
  if (!data) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.QUESTION.NOT_FOUND);
  }
  return data;
}

/** Function to delete question */
service.deleteResource = async (payload) => {
  const question = await QuestionModel.findById(payload.questionID).lean();
  if (!question) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.QUESTION.NOT_FOUND);
  }
  if (question.createdBy.toString() != payload.user.userId.toString()) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED, MESSAGES.USER.UNAUTHORIZED);
  }
  if (!payload.hardDelete) {
    return await QuestionModel.findByIdAndUpdate(payload.questionID, { isDeleted: true }).lean();
  }
  return await QuestionModel.deleteOne({ _id: payload.questionID });
}

module.exports = { questionService: service }