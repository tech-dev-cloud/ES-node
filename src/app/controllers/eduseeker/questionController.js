const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { questionService } = require('../../services');
let controller = {};

/** Function to create Question */
controller.createResource = async (payload) => {
  const data = await questionService.createResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.CREATE, { data })
}

/** Function to Update Question */
controller.updateResource = async (payload) => {
  const data = await questionService.updatecreateResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.CREATE, { data })
}

/** Function to find Question */
controller.findResource = async (payload) => {
  const data = await questionService.findResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.CREATE, data)
}

/** Function to get question by ID */
controller.findResourceByID = async (payload) => {
  const data = await questionService.findResourceByID(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.CREATE, { data })
}

/** Function to delete Question */
controller.deleteResource = async (payload) => {
  const data = await questionService.deleteResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.QUESTION.CREATE, { data })
}

module.exports = { questionController: controller }