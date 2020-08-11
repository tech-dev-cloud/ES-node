const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { performanceService } = require('../../services');
let controller = {};

controller.startQuiz = async (payload) => {
  await performanceService.startQuiz(payload);
  return;
}

controller.saveAnswer = async (payload) => {
  const data = await performanceService.saveAnswer(payload);
  return data;
}

controller.updateStatus = async (payload) => {
  const data = await performanceService.updateStatus(payload);
  return data;
}

controller.submitQuiz = async (payload)=>{
  const data=await performanceService.submitQuiz(payload);
  return data;
}
module.exports = { performanceController: controller };