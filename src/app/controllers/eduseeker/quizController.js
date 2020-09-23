const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const redis=require('../../../config/redisConnection');
const { quizService } = require('../../services');
const { QuizModel, PaymentModel } = require('../../models');

let controller = {}

controller.createQuiz =async (payload)=>{
  const data = await quizService.createQuiz(payload);
  // let quiz= new QuizModel({...payload, instructor:payload.user.userId,totalQuestions:payload.questionList.length});
  try{
    return responseHelper.createSuccessResponse(MESSAGES.QUIZ.CREATE, data);

  }catch(err){
    console.log(err);
  }
}

controller.findResource = async (payload) => {
  const data = await quizService.findResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUIZ.FETCH, data);
}

controller.flushCache = async(payload)=>{
  await quizService.flushCache(payload);
  return;
}

controller.getEnrolledQuiz=async(payload)=>{
  let enrolledData=await PaymentModel.find({userId:payload.user.userId, status: 'Credit'}).lean();
  if(enrolledData.length>0){
    let quizIds=enrolledData.map(obj=>obj.productId);
    let data=await quizService.findResource(payload, quizIds);
    return data;
  }
  // let data=await PaymentModel.aggregate([
    //   {$match: {userId:payload.user.userId, status: 'Credit'}},
    //   {$lookup: {from:'quizzes', localField:'productId', foreignField: '_id', as: 'enrolled'}},
    //   {$lookup: {from:'users', localField:'enrolled.instructor', foreignField: '_id', as: 'instructor'}},
    //   {$project:{payment_request_id:0, status:0, payment_id:0}}
    // ]);
    return {items:[]}
}

controller.findResourceById = async (payload) => {
  const data = await quizService.findResourceById(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.FETCH, data)
}

controller.updateQuiz=async(payload)=>{
  const data = await quizService.updateQuiz(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.UPDATE, data);
}

controller.getDataToPlay = async (payload) => {
  const data = await quizService.getDataToPlay(payload);
  return data;
}

controller.deleteQuiz = async(payload)=>{
  const data=await quizService.deleteQuiz(payload);
  return data;
}
module.exports = { quizController: controller };