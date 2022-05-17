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
async function getUserAttemptingQuiz(crieteria) {
  return PerformanceModel.find(crieteria).sort({ _id: -1 }).lean();
}
function checkUserAnswer(totalQuestion, userAnswers, lodash) {
  const counts = {
    correct: 0,
    incorrect: 0,
    notAnswered: 0,
    percentage: 0,
    totalQuestions: (totalQuestion || {}).length,
  };
  totalQuestion = lodash.keyBy(totalQuestion, '_id');
  for (const obj of userAnswers) {
    if (obj.answer[0] == totalQuestion[obj.question_id].correctOption[0]) {
      obj.resultStatus = DB.ANSWER_RESULT.CORRECT;
      counts.correct++;
    } else if (obj.answer[0]) {
      obj.resultStatus = DB.ANSWER_RESULT.INCORRECT;
      counts.incorrect++;
    } else {
      counts.notAnswered++;
    }
  }
  counts.percentage = Math.round(
    ((counts.correct * 2) / (counts.totalQuestions * 2)) * 100
  );
  return { counts };
}
function topicBasedChecking(totalQuestion, userAnswers, lodash) {
  const counts = {
    correct: 0,
    incorrect: 0,
    notAnswered: 0,
    percentage: 0,
    totalQuestions: totalQuestion.length,
  };
  const groupByTopic = lodash.groupBy(totalQuestion, 'topicId');
  totalQuestion = lodash.keyBy(totalQuestion, '_id');
  let topicPerformance = [];
  for (const topicId in groupByTopic) {
    const topicCounts = {
      correct: 0,
      incorrect: 0,
      notAnswered: 0,
      totalQuestions: groupByTopic[topicId].length,
      percentage: 0,
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
        }
      }
      topicCounts.percentage = Math.round(
        ((topicCounts.correct * 2) / (topicCounts.totalQuestions * 2)) * 100
      );
    }
    topicCounts.notAnswered =
      topicCounts.totalQuestions -
      (topicCounts.correct + topicCounts.incorrect);
    topicPerformance.push({ topicId, ...topicCounts });
  }
  counts.percentage = Math.round(
    ((counts.correct * 2) / (counts.totalQuestions * 2)) * 100
  );
  return { counts, topicPerformance };
}
module.exports = {
  getQuizQuestions,
  getProductMapQuestion,
  getUserAttemptingQuiz,
  checkUserAnswer,
  topicBasedChecking,
};
