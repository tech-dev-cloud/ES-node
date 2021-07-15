const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { quizService, productService } = require('../../services');
const { PaymentModel, ProductQuestionMap, Order } = require('../../mongo-models');
const common = require('../../utils/common');
const { NOT_ENROLLED } = require('../../utils/errorCodes');

let controller = {}

controller.createQuiz = async (payload) => {
  const data = await quizService.createQuiz(payload);
  // let quiz= new QuizModel({...payload, instructor:payload.user.userId,totalQuestions:payload.questionList.length});
  try {
    return responseHelper.createSuccessResponse(MESSAGES.QUIZ.CREATE, data);

  } catch (err) {
    console.log(err);
  }
}

controller.findResource = async (payload) => {
  const data = await quizService.findResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUIZ.FETCH, data);
}

controller.flushCache = async (payload) => {
  const data = await quizService.flushCache(payload);
  return responseHelper.createSuccessResponse("", data);
}

controller.getEnrolledQuiz = async (payload) => {
  let enrolledData = await PaymentModel.find({ userId: payload.user.userId, status: 'Credit' }, { productId: 1 }).lean();
  if (enrolledData && enrolledData.length > 0) {
    let quizIds = enrolledData.map(obj => obj.productId.toString());
    const data = await quizService.findResource(payload, quizIds);
    return data;
  }
  // let data=await PaymentModel.aggregate([
  //   {$match: {userId:payload.user.userId, status: 'Credit'}},
  //   {$lookup: {from:'quizzes', localField:'productId', foreignField: '_id', as: 'enrolled'}},
  //   {$lookup: {from:'users', localField:'enrolled.instructor', foreignField: '_id', as: 'instructor'}},
  //   {$project:{payment_request_id:0, status:0, payment_id:0}}
  // ]);
  return { items: [] }
}

controller.findResourceById = async (payload) => {
  const data = await quizService.findResourceById(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.FETCH, data)
}

controller.updateQuiz = async (payload) => {
  const data = await quizService.updateQuiz(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.UPDATE, data);
}

controller.getDataToPlay = async (request, response) => {
  let product_id = request.params.product_id;
  let questions = [];
  const isPurchased = await Order.findOne({ product_id: product_id, user_id: request.user._id, order_status: { $in: ['Credit', 'Free'] } }).lean();
  if (isPurchased) {
    let product = await productService.getProduct(product_id);
    let question_ids = await ProductQuestionMap.find({ product_id }, { question_id: 1 }).lean();
    for (let index = 0; index < question_ids.length; index++) {
      let obj = await common.getQuestion(question_ids[index].question_id);
      if (obj) {
        questions.push(obj);
      }
    }
    response.status(200).json({
      success: true,
      message: 'Quiz Data to play',
      data: { questions, product }
    })
  } else {
    throw NOT_ENROLLED;
    // response.status(400).json({
    //   success: false,
    //   message: 'You have to purchase this quiz',

    // })
  }
}

controller.deleteQuiz = async (payload) => {
  const data = await quizService.deleteQuiz(payload);
  return data;
}
module.exports = { quizController: controller };