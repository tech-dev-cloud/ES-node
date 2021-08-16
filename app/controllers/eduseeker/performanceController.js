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
  let criteria = request.body.resume_doc_id
    ? { _id: request.body.resume_doc_id }
    : {
        product_id: request.body.product_id,
        user_id: request.user._id,
      };
  const quiz = await PerformanceModel.findOne(criteria).lean();
  let dataToUpdate;
  if (request.body.resume_doc_id) {
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
    PerformanceModel.findOneAndUpdate(criteria, dataToUpdate, {
      new: true,
      upsert: true,
    }).then((res) => {});
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
    data.save().then((res) => {});
  }

  response.status(200).json({
    success: true,
    message: 'Answer saved successfully',
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
  let criteria = {
    product_id: request.body.product_id,
    user_id: request.user._id,
  };
  const attemtQuiz = (
    await getUserAttemptingQuiz(criteria.user_id, criteria.product_id)
  )[0];

  const questions =
    request.body.type == 'quiz'
      ? await getQuizQuestions(request.body.product_id)
      : (await getProductMapQuestion(request.body.product_id)).map(
          (obj) => obj.questionData
        );
  let userAnswers = attemtQuiz.userAnswers;
  let quizQuestions = questions;

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
  PerformanceModel.findOneAndUpdate({ _id: attemtQuiz._id }, dataToUpdate).then(
    (res) => {}
  );
  response.status(200).json({
    success: true,
    message: 'Quiz submitted successfully',
  });
};
module.exports = { performanceController: controller };
