const _ = require('lodash');
const mongoose = require('mongoose');
const { PerformanceModel, Topics } = require('../../mongo-models');
const { ProductService } = require('../../services');
const {
  getQuizQuestions,
  getProductMapQuestion,
  checkUserAnswer,
  topicBasedChecking,
} = require('../../services/quiz');
const common = require('../../utils/common');
const { DB, quiz_result } = require('../../utils/constants');
const QuizService = require('./quizService');

const controller = {
  createQuiz: async (request, response) => {
    const quizService = new QuizService();
    try {
      const data = await quizService.addNewQuiz(request.body, request.user._id);
      response.status(200).json({
        success: true,
        message: 'Quiz created successfully',
        data,
      });
    } catch (err) {
      throw err;
    }
  },
  async updateQuiz(request, response) {
    const quizService = new QuizService();
    try {
      const data = await quizService.updateQuiz(
        request.params.id,
        request.user._id,
        request.body
      );
      response.status(200).json({
        success: true,
        message: 'Quiz created successfully',
        data,
      });
    } catch (err) {
      throw err;
    }
  },
  async getQuiz(request, response) {
    const skip = parseInt(request.query.skip) || 0;
    const limit = parseInt(request.query.limit) || 20;
    const search = request.query.searchString;
    const quizService = new QuizService();
    try {
      const match = { createdBy: request.user._id };
      if (search) {
        match['$text'] = { $search: search };
      }
      const data = await quizService.getQuiz(match, skip, limit);
      response.status(200).json({
        success: true,
        message: 'Quiz created successfully',
        data,
      });
    } catch (err) {
      throw err;
    }
  },
  async getQuizById(request, response) {
    const quizService = new QuizService();
    const data = await quizService.getQuiz(
      {
        createdBy: request.user._id,
        _id: request.params.id,
      },
      0,
      1
    );
    response.status(200).json({
      success: true,
      message: 'Quiz created successfully',
      data: data[0],
    });
  },
  async getDataToPlay(request, response) {
    let questions;
    let product;
    let existingAttempt;
    const data =
      request.query.type == 'quiz'
        ? (await getQuizQuestions(request.params.product_id))[0]
        : (await getProductMapQuestion(request.params.product_id)).map(
            (obj) => obj.questionData
          );

    if (request.query.resume_doc_id) {
      existingAttempt = await PerformanceModel.findOne({
        _id: request.query.resume_doc_id,
      }).lean();
    }
    if (existingAttempt && existingAttempt.status == 'completed') {
      existingAttempt['questionsWithAns'] = _.keyBy(
        data.length ? data : data.questionData,
        '_id'
      );
    }
    if (request.query.type == 'quiz') {
      questions = data.questionData;
      delete data.questionData;
      product = _.pick(data, [
        'title',
        'exam',
        'type',
        'attemptTime',
        'totalQuestions',
        'difficultLevel',
      ]);
      delete product.questionList;
    } else {
      questions = data;
      const obj = new ProductService();
      product = await obj.getProduct(request.params.product_id);
      product = {
        title: product.name,
        attemptTime: product.product_meta.time_limit,
        totalQuestions: product.product_meta.totalQuestions,
      };
    }
    response.status(200).json({
      success: true,
      data: {
        product,
        questions,
        ...(existingAttempt ? { existingAttempt } : {}),
      },
    });
  },
  async getQuizResult(request, response) {
    let responseObject = {};
    let cutOffMeet = false;
    let strength = [];
    let weakness = [];
    let product;
    const attemptData = await PerformanceModel.findOne({
      _id: request.params.docId,
    }).lean();
    let questionsData;
    let topicPerformanceData;
    const timeTaken = {
      minutes: 0,
      seconds: 0,
    };
    let obj = new ProductService();
    product = await obj.getProduct(attemptData.product_id);
    if (attemptData.type == 'quiz') {
      questionsData = (await getQuizQuestions(attemptData.product_id))[0];
      const data = topicBasedChecking(
        questionsData.questionData,
        attemptData.userAnswers,
        _
      );
      topicPerformanceData = data.topicPerformance;
      const topicIds = topicPerformanceData.map((obj) =>
        mongoose.Types.ObjectId(obj.topicId)
      );
      let topics = await Topics.find(
        { _id: { $in: topicIds } },
        { name: 1, _id: 1 }
      ).lean();
      topics = _.keyBy(topics, '_id');
      topicPerformanceData = topicPerformanceData.map((obj) => ({
        ...obj,
        topicName: topics[obj.topicId].name,
      }));
      for (let obj of topicPerformanceData) {
        if (obj.percentage >= 80) {
          strength.push(obj);
        } else if (obj.percentage <= 40) {
          weakness.push(obj);
        }
      }
      timeTaken.minutes =
        questionsData.attemptTime -
        (attemptData.remainingTime.hours * 60 +
          attemptData.remainingTime.minutes);
      timeTaken.seconds = 60 - attemptData.remainingTime.seconds;
    } else {
      cutOffMeet = attemptData.finalScore >= product.cutOffMeet;
      timeTaken.minutes =
        product.product_meta.time_limit -
        (attemptData.remainingTime.hours * 60 +
          attemptData.remainingTime.minutes);
      timeTaken.seconds = 60 - attemptData.remainingTime.seconds;
    }
    responseObject = {
      ...(cutOffMeet ? { ...quiz_result.pass } : { ...quiz_result.fail }),
      ...(strength.length || weakness.length ? { strength, weakness } : {}),
      ...attemptData,
      timeTaken,
      product,
    };
    response.status(200).json({
      success: true,
      data: responseObject,
    });
  },
  async getLeaderBoard(request, response) {
    let userRanking = await PerformanceModel.aggregate([
      {
        $match: {
          product_id: request.params.quizID,
          status: DB.QUIZ_PLAY_STATUS.COMPLETED,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $sort: { finalScore: -1 } },
    ]);
    const groupedRanking = _.groupBy(userRanking, 'user_id');
    userRanking = [];
    for (let user_id in groupedRanking) {
      userRanking.push(groupedRanking[user_id][0]);
    }
    userRanking = userRanking.map((obj, index) => ({
      ...obj,
      rank: index + 1,
    }));
    let userAttemptIndex = userRanking.findIndex(
      (obj) => obj.user_id == request.user._id
    );
    if (userAttemptIndex >= 3) {
      userRanking = userRanking.splice(3, 0, {
        ...userRanking[userAttemptIndex],
        active: true,
      });
    } else if (userAttemptIndex >= 0) {
      userRanking = userRanking.splice(0, 3);
      userRanking[userAttemptIndex].active = true;
    }
    userRanking = userRanking.map((obj) => ({
      rank: obj.rank,
      finalScore: obj.finalScore,
      username: obj.user.name,
      userpic: (obj.user.googleDetails || {}).profile_pic,
    }));
    response.status(200).json({
      success: true,
      data: userRanking,
    });
  },
};
module.exports = { quizController: controller };
