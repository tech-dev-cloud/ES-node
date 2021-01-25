const _=require('lodash');
const { performanceService } = require('../../services');
const { PerformanceModel } = require('../../models');
const { DB } = require('../../utils/constants');
let controller = {};

controller.startQuiz = async (payload) => {
  // const quiz = await PaymentModel.findOne({ productId: payload.quizId, userId: payload.user.userId, status: 'Credit' }).lean();
  // if (quiz) {
  //   const obj = new PerformanceModel({ quizId: payload.quizId, userId: payload.user.userId, remainingTime: quiz.attemptTime });
  //   await obj.save();
  //   return;
  // } else {
  //   throw responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED)
  // }
}

controller.saveAnswer = async (request, response) => {
  // const data = await performanceService.saveAnswer(payload);
  let criteria = {
    product_id: request.body.quizId,
    user_id: request.user._id
  }
  const quiz = await PerformanceModel.findOne(criteria).lean();
  let dataToUpdate;
  if (quiz) {
    let index=(quiz.userAnswers && quiz.userAnswers.length)?quiz.userAnswers.findIndex(obj=>obj.question_id.toString()==request.body.userAnswers.question_id.toString()):-1;
    if (index>-1) {
      criteria["userAnswers.question_id"] = request.body.userAnswers.question_id;
      dataToUpdate = {
        $set: {
          [`userAnswers.${index}`]: request.body.userAnswers,
          remainingTime: request.body.remainingTime,
        }
      }
    } else {
      dataToUpdate = {
        $push: {
          "userAnswers": request.body.userAnswers
        },
        $set: { remainingTime: request.body.remainingTime }
      }
    }
  }else{
    dataToUpdate={
      product_id:request.body.quizId,
      user_id:request.user._id,
      remainingTime:request.body.remainingTime,
      userAnswers:request.body.userAnswers
    }
  }
  const data = await PerformanceModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert:true }).lean();
  response.status(200).json({
    success:true,
    message:'Answer saved successfully',
    data
  })
}

controller.updateStatus = async (payload) => {
  const data = await performanceService.updateStatus(payload);
  return data;
}

controller.submitQuiz = async (request,response)=>{
  let criteria = {
    product_id: request.body.product_id,
    user_id: request.user._id
  };
  let query=[
    {$match: criteria},
    {$lookup: {from:'product_question_maps', localField:'product_id', foreignField:'product_id', as:'quizData'}},
    {$project:{'quizData._id':0, 'quizData.title':0,'quizData.headline':0,'quizData.subjectId':0,
        'quizData.status':0,'quizData.isPaid':0,'quizData.amount':0,'quizData.instructor':0,
        'quizData.instructionalLevel':0,'quizData.attemptTime':0,'quizData.productType':0,'quizData.isDeleted':0
      }
    },
    {$lookup: {from:'questions', localField:'quizData.question_id', foreignField:'_id', as:'questions'}}
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
    if(obj.answer[0]==quizQuestions[obj.question_id].correctOption[0]){
      obj.resultStatus=DB.ANSWER_RESULT.CORRECT;
      counts.correct++
    }else if(obj.answer[0]){
      obj.resultStatus=DB.ANSWER_RESULT.INCORRECT;
      counts.incorrect++
    }
  })
  counts.notAnswered=data.questions.length-(counts.correct+counts.incorrect);
  
  let dataToUpdate={
    status: DB.QUIZ_PLAY_STATUS.COMPLETED,
    userAnswers,
    ...counts,
    finalScore: counts.correct*2,
    totalScore: data.questions.length * 2,
    questionsWithAns:quizQuestions,
    
  }
  // data=await PerformanceModel.findOneAndUpdate(criteria, dataToUpdate, { new: true }).lean();
  data=await PerformanceModel.findOneAndDelete(criteria);
  response.status(200).json({
    success:true,
    message:"Quiz submitted successfully",
    data:dataToUpdate
  })
}
module.exports = { performanceController: controller };