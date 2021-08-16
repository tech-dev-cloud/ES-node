const {
  QuizModel,
  ProductQuestionMap,
  PerformanceModel,
} = require('../mongo-models');
const { DB } = require('../utils/constants');

function getQuizQuestions(quizId) {
  return QuizModel.aggregate([
    { $match: { _id: quizId } },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionList',
        foreignField: '_id',
        as: 'questionData',
      },
    },
  ]);
}
function getProductMapQuestion(product_id) {
  return ProductQuestionMap.aggregate([
    { $match: { product_id } },
    {
      $lookup: {
        from: 'questions',
        localField: 'question_id',
        foreignField: '_id',
        as: 'questionData',
      },
    },
    { $unwind: '$questionData' },
  ]);
}
function getUserAttemptingQuiz(user_id, product_id, status) {
  return PerformanceModel.find({ product_id, user_id });
}
function checkUserAnswer(totalQuestion, userAnswers, lodash) {
  totalQuestion = lodash.keyBy(totalQuestion, '_id');
  const counts = {
    correct: 0,
    incorrect: 0,
    notAnswered: 0,
  };
  for (const obj of userAnswers) {
    if (obj.answer[0] == totalQuestion[obj.question_id].correctOption[0]) {
      obj.resultStatus = DB.ANSWER_RESULT.CORRECT;
      counts.correct++;
    } else if (obj.answer[0]) {
      obj.resultStatus = DB.ANSWER_RESULT.INCORRECT;
      counts.incorrect++;
    }
  }
  return { counts };
}
function topicBasedChecking(totalQuestion, userAnswers, lodash) {
  const groupByTopic = lodash.groupBy(totalQuestion, 'topicId');
  totalQuestion = lodash.keyBy(totalQuestion, '_id');
  const topicPerformance = [];
  const counts = {
    correct: 0,
    incorrect: 0,
    notAnswered: 0,
  };
  for (const topicId in groupByTopic) {
    const topicCounts = {
      correct: 0,
      incorrect: 0,
      notAnswered: 0,
      totalQuestions: 0,
    };
    for (const obj of userAnswers) {
      if (totalQuestion[obj.question_id].topicId == topicId) {
        if (obj.answer[0] == totalQuestion[obj.question_id].correctOption[0]) {
          obj.resultStatus = DB.ANSWER_RESULT.CORRECT;
          counts.correct++;
          topicCounts.correct++;
        } else if (obj.answer[0]) {
          obj.resultStatus = DB.ANSWER_RESULT.INCORRECT;
          counts.incorrect++;
          topicCounts.incorrect++;
        } else {
          topicCounts.notAnswered++;
        }
        topicCounts.totalQuestions++;
      }
    }
    topicPerformance.push({ topicId, ...topicCounts });
  }
  return { counts, topicPerformance };
}
module.exports = {
  getQuizQuestions,
  getProductMapQuestion,
  getUserAttemptingQuiz,
  checkUserAnswer,
  topicBasedChecking,
};
