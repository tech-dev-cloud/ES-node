let _ = require('lodash');
const redis=require('../../config/redisConnection');
const params=require('../../config/env/development_params.json');

let { QuizModel, PaymentModel } = require('../models');
const { USER_ROLE, ERROR_TYPE, DEFAULT, DB } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const dbUtils = require('../utils/utils');
const responseHelper = require('../utils/responseHelper');
const { reject } = require('async');

let service = {};

service.getQuiz = async (payload) => {
  return QuizModel.findOne(payload).lean();
}

/**
 * Function to get the quiz list
 */
service.findResource = async (payload, quizIds=[]) => {
  return await  new Promise((resolve, reject)=>{
    redis.get(params.dev_quiz_list_key,async (err, someData)=>{
      if(err || !someData ){
        // let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
        let instructorLookup = { from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor' };
        let skip = (payload.index || DEFAULT.INDEX) * (payload.limit || DEFAULT.LIMIT);
        
        let match={}
        // if(payload.user.role==USER_ROLE.TEACHER){
        //   match.instructor=payload.user.userId
        // }
        if(quizIds.length){
          match={_id: {$in:quizIds}}
        }

        let query = [
          { $match: match },
          // { $lookup: subjectLookup },
          // { $unwind: `$${subjectLookup.as}` },
          // { $lookup: examTypeLookup },
          { $lookup: instructorLookup },
          { $unwind: `$${instructorLookup.as}` },
          { $project: { questionList: 0, isDeleted: 0, status:0,examType:0,subjectId:0,difficultLevel:0,createdAt:0,updatedAt:0,__v:0 } },
          { $group: { _id: null, items: { $push: '$$ROOT' }, totalCounts: { $sum: 1 } } },
          { $addFields: { items: { $slice: ['$items', skip, payload.limit || DEFAULT.LIMIT] } } }
        ]
        let data=(await QuizModel.aggregate(query))[0] || [];
        redis.set(params.dev_quiz_list_key, JSON.stringify(data), (err)=>{
          redis.expire(params.dev_quiz_list_key, params.quiz_expiry);
        })
        resolve((await QuizModel.aggregate(query))[0] || []);
      }else{
        return resolve(JSON.parse(someData));
      }
    })
  })
}

service.flushCache=async(payload)=>{
  return new Promise((resolve, reject)=>{
    redis.del(params.dev_quiz_list_key, (err, someData)=>{
      if(err){
        throw "Unable to clear cache"
      }
      resolve(null);
    })
  })
}

service.findResourceById = async (payload) => {
  return new Promise((resolve,reject)=>{
    let cacheKey=params.dev_quiz+payload.quizId;
    redis.get(cacheKey, async (err, someData)=>{
      if(err || ! someData){
        let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
        // let instructorLookup = { from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor' };
        let questionLookup = { from: 'questions', localField: 'questionList', foreignField: '_id', as: 'questions' };
        let match={
          _id: payload.quizId
        };
      
        let query = [
          { $match: match },
          { $lookup: subjectLookup },
          { $unwind: `$${subjectLookup.as}` },
          // { $lookup: instructorLookup },
          // { $unwind: `$${instructorLookup.as}` },
          { $lookup: questionLookup},
          { $project: { isDeleted: 0, 'instructor.password': 0 } }
        ]
        let data=(await QuizModel.aggregate(query))[0];
        redis.set(cacheKey, JSON.stringify(data), err=>{
          redis.expire(cacheKey, params.quiz_expiry)
        })
        resolve(data);
      }else{
        resolve(JSON.parse(someData));
      }
    })
  })


}

service.upldateQuiz = async (payload) => {
  
  return QuizModel.findOneAndUpdate({_id:payload.quizId,instructor:payload.user.userId}, {...payload,totalQuestions:questionList.length}).lean();
}

service.getDataToPlay = async (payload) => {
  const isPurchased = await PaymentModel.findOne({ productId: payload.quizId, userId: payload.user.userId, status: 'Credit' }).lean();
  if (isPurchased) {
    let questionLookup = { from: 'questions', localField: 'questionList', foreignField: '_id', as: 'questions' };
    let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
    // let performanceLookup = { from: 'performances', localField: '_id', foreignField: 'quizId', as: 'playStatus' };
    let match = { $match: { _id: payload.quizId } };
    let query = [
      match,
      { $lookup: questionLookup },
      { $lookup: subjectLookup },
      { $unwind: `$${subjectLookup.as}` },
      // { $lookup: performanceLookup},
      // { $unwind: {path:`$${performanceLookup.as}`, preserveNullAndEmptyArrays:true }},
      { $project: { questionList: 0 } }
    ]
    let data = (await QuizModel.aggregate(query))[0];
    // if(data.playStatus && data.playStatus.status==DB.QUIZ_PLAY_STATUS.COMPLETED){
    //   data.playStatus['questionWithAns'] = _.keyBy(data.questions,'_id');
    // }
    return data;
  }
  throw responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED)
}

service.deleteQuiz=async(payload)=>{
  if (!payload.hardDelete) {
    return await QuizModel.findOneAndDelete({ _id: payload.quizId }, { isDeleted: true }).lean();
  }
  return await QuizModel.deleteOne({ _id: payload.id });
}
module.exports = { quizService: service };