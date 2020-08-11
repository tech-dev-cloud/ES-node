const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { quizService } = require('../../services');

let controller = {}

controller.findResource = async (payload) => {
  const data = await quizService.findResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.CREATE, data);
}

controller.findResourceById = async (payload) => {
  const data = await quizService.findResourceById(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.FETCH, data)
}

controller.getDataToPlay = async (payload) => {
  const data = await quizService.getDataToPlay(payload);
  return data;
}
module.exports = { quizController: controller };