let _ = require('lodash');
const redis=require('../../config/redisConnection');
const params=require('../../config/env/development_params.json');

let { QuizModel, PaymentModel } = require('../models');
const { USER_ROLE, ERROR_TYPE, DEFAULT, DB } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const dbUtils = require('../utils/utils');
const responseHelper = require('../utils/responseHelper');
const common = require('../utils/common');

let service = {};

service.getQuiz = async (payload) => {
  return QuizModel.findOne(payload).lean();
}

service.createQuiz =async (payload)=>{
  let quiz= new QuizModel({...payload, instructor:payload.user.userId,totalQuestions:payload.questionList.length});
  return await quiz.save(); 
}

/**
 * Function to get the quiz list
 */
service.findResource = async (payload, quizIds=[]) => {
  let match={status:true};
  let items=[];
  if(quizIds.length==0){
    try{
      if(payload.searchString){
        match['$text']={$search:payload.searchString}
      }
      quizIds=await QuizModel.find(match,{_id:1}).lean();

    }catch(err){
      console.log(err);
    }
    quizIds=quizIds.map(obj=>obj._id);
  }
  for(let i=0;i<quizIds.length;i++){
    let quiz=await common.getQuizData(quizIds[i]);
    items.push(quiz);
  }
  return {items,counts:items.length};
}

service.flushCache=async(payload)=>{
  let ids=(payload.id)?payload.id.split(","):'';
  if(ids.length==0){
    ids=await QuizModel.find({status:true},{project:{_id:1}}).lean();
    ids=ids.map(obj=>params.dev_quiz+obj._id.toString());
  }else{
    ids=ids.map(id=>params.dev_quiz+id)
  }
  await common.flushCache(ids);
  return {sccess:true, message:"Cache clear"}
}

service.findResourceById = async (payload) => {
  return await common.getQuizData(payload.quizId);
}

service.updateQuiz = async (payload) => {
  
  return QuizModel.findOneAndUpdate({_id:payload.quizId,instructor:payload.user.userId}, {...payload,totalQuestions:payload.questionList.length}).lean();
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
    return await QuizModel.updateOne({ _id: payload.quizId }, {$set:{isDeleted: true} }).lean();
  }
  return await QuizModel.deleteOne({ _id: payload.id });
}
module.exports = { quizService: service };