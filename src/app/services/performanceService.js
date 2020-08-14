let _ =require('lodash');
let { PaymentModel, PerformanceModel } = require('../models');
const { MONGO_ERROR, ERROR_TYPE, DEFAULT, DB } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const dbUtils = require('../utils/utils');
const responseHelper = require('../utils/responseHelper');
let service = {};


service.startQuiz = async (payload) => {
  const quiz = await PaymentModel.findOne({ productId: payload.quizId, userId: payload.user.userId, status: 'Credit' }).lean();
  if (quiz) {
    const obj = new PerformanceModel({ quizId: payload.quizId, userId: payload.user.userId, remainingTime: quiz.attemptTime });
    await obj.save();
    return;
  } else {
    throw responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED)
  }
}

service.saveAnswer = async (payload) => {
  let criteria = {
    quizId: payload.quizId,
    userId: payload.user.userId
  }
  const quiz = await PerformanceModel.findOne(criteria).lean();
  let dataToUpdate;
  if (quiz) {
    let index=(quiz.userAnswers)?quiz.userAnswers.findIndex(obj=>obj.questionId.toString()==payload.userAnswers.questionId.toString()):-1;
    if (index>-1) {
      criteria["userAnswers.questionId"] = payload.userAnswers.questionId;
      dataToUpdate = {
        $set: {
          [`userAnswers.${index}`]: payload.userAnswers,
          remainingTime: payload.remainingTime,
        }
      }
    } else {
      dataToUpdate = {
        $push: {
          "userAnswers": payload.userAnswers
        },
        $set: { remainingTime: payload.remainingTime }
      }
    }
  }else{
    dataToUpdate={
      quizId:payload.quizId,
      userId:payload.user.userId,
      remainingTime:payload.remainingTime,
      userAnswers:payload.userAnswers
    }
  }
    const data = await PerformanceModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert:true }).lean();
    return data;
}


service.updateStatus=async(payload)=>{
  const data = await PerformanceModel.findOneAndUpdate({quizId:payload.quizId, userId:payload.user.userId},payload, { upsert:true }).lean();
  return true;
}

service.submitQuiz=async(payload)=>{
  let criteria = {
    quizId: payload.quizId,
    userId: payload.user.userId
  };
  let query=[
    {$match: criteria},
    {$lookup: {from:'quizzes', localField:'quizId', foreignField:'_id', as:'quizData'}},
    {$unwind:'$quizData'},
    {$project:{'quizData._id':0, 'quizData.title':0,'quizData.headline':0,'quizData.subjectId':0,
        'quizData.status':0,'quizData.isPaid':0,'quizData.amount':0,'quizData.instructor':0,
        'quizData.instructionalLevel':0,'quizData.attemptTime':0,'quizData.productType':0,'quizData.isDeleted':0
        }
    },
    {$lookup: {from:'questions', localField:'quizData.questionList', foreignField:'_id', as:'questions'}}
  ]
  let data=(await PerformanceModel.aggregate(query))[0];
  let userAnswers=data.userAnswers;
  let quizQuestions=data.questions;
  quizQuestions=_.keyBy(quizQuestions,'_id');
  let counts={
    correct:0,
    incorrect:0,
    notAnswered:0
  }
  userAnswers.forEach(obj=>{
    if(obj.answer[0]==quizQuestions[obj.questionId].correctOption[0]){
      obj.resultStatus=DB.ANSWER_RESULT.CORRECT;
      counts.correct++
    }else if(obj.answer[0]){
      obj.resultStatus=DB.ANSWER_RESULT.INCORRECT;
      counts.incorrect++
    }else{
      obj.resultStatus=DB.ANSWER_RESULT.NOT_ATTEMPT;
      counts.notAnswered++;
    }
  })
  let dataToUpdate={
    status: DB.QUIZ_PLAY_STATUS.COMPLETED,
    userAnswers,
    ...counts
  }
  data=await PerformanceModel.findOneAndUpdate(criteria, dataToUpdate, { new: true }).lean();
  return {...dataToUpdate, questionsWithAns: {...quizQuestions} };
}
module.exports = { performanceService: service }