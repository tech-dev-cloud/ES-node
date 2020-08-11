let _ = require('lodash');
let { QuizModel, PaymentModel } = require('../models');
const { MONGO_ERROR, ERROR_TYPE, DEFAULT, DB } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const dbUtils = require('../utils/utils');
const responseHelper = require('../utils/responseHelper');

let service = {};

service.getQuiz = async (payload) => {
  return QuizModel.findOne(payload).lean();
}

/**
 * Function to get the quiz list
 */
service.findResource = async (payload) => {
  let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
  // let examTypeLookup = { from: 'examtypes', localField: 'examType', foreignField: '_id', as: 'examTypeData' };
  let instructorLookup = { from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor' };
  let skip = (payload.index || DEFAULT.INDEX) * (payload.limit || DEFAULT.LIMIT);
  let query = [
    // { $match: { isDeleted: false, status: true } },
    { $lookup: subjectLookup },
    { $unwind: `$${subjectLookup.as}` },
    // { $lookup: examTypeLookup },
    { $lookup: instructorLookup },
    { $unwind: `$${instructorLookup.as}` },
    { $project: { questionList: 0, isDeleted: 0 } },
    {
      $group: {
        _id: null, items: { $push: '$$ROOT' }, totalCounts: { $sum: 1 }
      }
    },
    { $addFields: { items: { $slice: ['$items', skip, payload.limit || DEFAULT.LIMIT] } } }
  ]
  return (await QuizModel.aggregate(query))[0];
}

service.findResourceById = async (payload) => {
  let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
  let instructorLookup = { from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor' };

  let query = [
    { $match: { isDeleted: false, _id: payload.quizId } },
    { $lookup: subjectLookup },
    { $unwind: `$${subjectLookup.as}` },
    { $lookup: instructorLookup },
    { $unwind: `$${instructorLookup.as}` },
    { $project: { questionList: 0, isDeleted: 0, 'instructor.password': 0 } }
  ]
  return (await QuizModel.aggregate(query))[0];

}

service.getDataToPlay = async (payload) => {
  const isPurchased = await PaymentModel.findOne({ productId: payload.quizId, userId: payload.user.userId, status: 'Credit' }).lean();
  if (isPurchased) {
    let questionLookup = { from: 'questions', localField: 'questionList', foreignField: '_id', as: 'questions' };
    let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
    let performanceLookup = { from: 'performances', localField: '_id', foreignField: 'quizId', as: 'playStatus' };
    let match = { $match: { _id: payload.quizId } };
    let query = [
      match,
      { $lookup: questionLookup },
      { $lookup: subjectLookup },
      { $unwind: `$${subjectLookup.as}` },
      { $lookup: performanceLookup},
      { $unwind: {path:`$${performanceLookup.as}`, preserveNullAndEmptyArrays:true }},
      { $project: { questionList: 0 } }
    ]
    let data = (await QuizModel.aggregate(query))[0];
    if(data.playStatus && data.playStatus.status==DB.QUIZ_PLAY_STATUS.COMPLETED){
      data.playStatus['questionWithAns'] = _.keyBy(data.questions,'_id');
    }
    return data;
  }
  throw responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED)
}
module.exports = { quizService: service };