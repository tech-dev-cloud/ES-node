const _ = require('lodash');
const { PerformanceModel } = require('../../mongo-models');
const { DB } = require('../../utils/constants');
const {
  getQuizQuestions,
  getProductMapQuestion,
  getUserAttemptingQuiz,
  checkUserAnswer,
} = require('../../services/quiz');
const { QuizResult } = require('../../mongo-models/quizResult');
let controller = {};

controller.startQuiz = async (payload) => {};

controller.saveAnswer = async (request, response) => {
  let responseObject;
  let criteria = request.body.resume_doc_id
    ? { _id: request.body.resume_doc_id }
    : {
        product_id: request.body.product_id,
        user_id: request.user._id,
      };
  const quiz = await PerformanceModel.findOne(criteria)
    .sort({ _id: -1 })
    .lean();
  let dataToUpdate;
  if (quiz && quiz.status != DB.QUIZ_PLAY_STATUS.COMPLETED) {
    let index =
      quiz.userAnswers && quiz.userAnswers.length
        ? quiz.userAnswers.findIndex(
            (obj) =>
              obj.question_id.toString() ==
              request.body.userAnswers.question_id.toString()
          )
        : -1;
    if (index > -1) {
      criteria['userAnswers.question_id'] =
        request.body.userAnswers.question_id;
      dataToUpdate = {
        $set: {
          [`userAnswers.${index}`]: request.body.userAnswers,
          remainingTime: request.body.remainingTime,
        },
      };
    } else {
      dataToUpdate = {
        $push: {
          userAnswers: request.body.userAnswers,
        },
        $set: { remainingTime: request.body.remainingTime },
      };
    }
    responseObject = await PerformanceModel.findOneAndUpdate(
      criteria,
      dataToUpdate,
      {
        new: true,
        upsert: true,
      }
    );
  } else {
    dataToUpdate = {
      product_id: request.body.product_id,
      user_id: request.user._id,
      remainingTime: request.body.remainingTime,
      userAnswers: request.body.userAnswers,
      type: request.body.type,
      status: DB.QUIZ_PLAY_STATUS.IN_PROGRESS,
    };
    const data = new PerformanceModel(dataToUpdate);
    responseObject = await data.save();
  }

  response.status(200).json({
    success: true,
    message: 'Answer saved successfully',
    data: responseObject,
  });
};

controller.updateStatus = async (request, response) => {
  const data = await PerformanceModel.findOneAndUpdate(
    { product_id: request.body.product_id, user_id: request.user._id },
    request.body,
    { upsert: true }
  ).lean();
  response.status(200).json({
    success: true,
    message: 'Quiz updated successfully',
    data,
  });
};

controller.submitQuiz = async (request, response) => {
  let criteria = request.body.session_id
    ? { _id: request.body.session_id }
    : {
        product_id: request.body.product_id,
        user_id: request.user._id,
      };
  const attemtQuiz = (await getUserAttemptingQuiz(criteria))[0];

  const questions =
    attemtQuiz.type == 'quiz'
      ? (await getQuizQuestions(request.body.product_id))[0]
      : (await getProductMapQuestion(request.body.product_id)).map(
          (obj) => obj.questionData
        );
  let userAnswers = attemtQuiz.userAnswers;
  let quizQuestions = questions.length ? questions : questions.questionData;

  const { counts } = checkUserAnswer(quizQuestions, userAnswers, _);
  counts.notAnswered =
    quizQuestions.length - (counts.correct + counts.incorrect);

  let dataToUpdate = {
    status: DB.QUIZ_PLAY_STATUS.COMPLETED,
    userAnswers,
    ...counts,
    finalScore: counts.correct * 2,
    totalScore: quizQuestions.length * 2,
    questionsWithAns: _.keyBy(quizQuestions, '_id'),
  };
  let data = await PerformanceModel.findOneAndUpdate(
    { _id: attemtQuiz._id },
    dataToUpdate,
    { new: true }
  ).lean();
  response.status(200).json({
    success: true,
    message: 'Quiz submitted successfully',
    data,
  });
};
module.exports = { performanceController: controller };
