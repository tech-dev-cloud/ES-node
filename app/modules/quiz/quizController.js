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
    const quizService = new QuizService();
    try {
      const data = await quizService.getQuiz(
        {
          createdBy: request.user._id,
        },
        request.query.skip,
        request.query.limit
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
  async getQuizById(request, response) {
    const quizService = new QuizService();
    try {
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
    } catch (err) {
      throw err;
    }
  },
};

// controller.createQuiz = async (request, response) => {
//   const quiz = new QuizModel({
//     ...request.body,
//     totalQuestions: request.body.questionList.length,
//   });
//   quiz.save().then((res) => {
//     response.status(200).json({
//       success: true,
//       message: 'Quiz created successfully',
//     });
//   });
// };

// controller.findResource = async (payload) => {
//   const data = await quizService.findResource(payload);
//   return responseHelper.createSuccessResponse(MESSAGES.QUIZ.FETCH, data);
// };

// controller.flushCache = async (payload) => {
//   const data = await quizService.flushCache(payload);
//   return responseHelper.createSuccessResponse('', data);
// };

// controller.getQuizList = async (request, response) => {
//   const $match = { isDeleted: false };
//   const $text = {};
//   const skip = request.query.skip || 0;
//   const limit = request.query.limit || 10;
//   if (request.headers.admin) {
//     $match['createdBy'] = request.user._id;
//   }
//   if (request.query.searchString) {
//     $text['$search'] = request.query.searchString;
//   }
//   let data = await QuizModel.find({ $match, $text })
//     .skip(skip)
//     .limit(limit)
//     .lean();
//   response.status(200).json({
//     success: true,
//     data,
//   });
// };

// controller.getQuizByID = async (request, response) => {
//   const data = await QuizModel.findOne({
//     _id: request.params.quizId,
//     createdBy: request.user._id,
//     isDeleted: false,
//   }).lean();
//   response.status(200).json({
//     success: true,
//     data,
//   });
// };

// controller.updateQuiz = async (request, response) => {
//   let quiz = await QuizModel.findOneAndUpdate(
//     { _id: request.params.quizId, createdBy: request.user._id },
//     { ...request.body, totalQuestions: payload.questionList.length },
//     { new: true }
//   ).lean();
//   response.status(200).json({
//     success: true,
//     message: 'Quiz updated successfully',
//     data: quiz,
//   });
// };

// controller.getDataToPlay = async (request, response) => {
//   let product_id = request.params.product_id;
//   let questions = [];
//   const isPurchased = await Order.findOne({
//     product_id: product_id,
//     user_id: request.user._id,
//     order_status: { $in: ['Credit', 'Free'] },
//   }).lean();
//   if (isPurchased) {
//     let product = await productService.getProduct(product_id);
//     let question_ids = await ProductQuestionMap.find(
//       { product_id },
//       { question_id: 1 }
//     ).lean();
//     for (let index = 0; index < question_ids.length; index++) {
//       let obj = await common.getQuestion(question_ids[index].question_id);
//       if (obj) {
//         questions.push(obj);
//       }
//     }
//     response.status(200).json({
//       success: true,
//       message: 'Quiz Data to play',
//       data: { questions, product },
//     });
//   } else {
//     throw NOT_ENROLLED;
//   }
// };

// controller.deleteQuiz = async (request, response) => {
//   const data = await QuizModel.updateOne(
//     { _id: request.params.quizId, createdBy: request.user._id },
//     { $set: { isDeleted: true } }
//   );
//   response.status(200).json({
//     success: true,
//     data,
//   });
// };
module.exports = { quizController: controller };
