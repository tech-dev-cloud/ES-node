const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { unitService } = require('../../services');
let controller = {};

/** Controller to create UNIT */
controller.createResource = async (payload) => {
  const data = await unitService.createResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.UNIT.CREATE, data)
};

/** Controller to find UNITs */
controller.findResource = async (payload) => {
  const data = await unitService.findResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.UNIT.FETCH, data);
}

/** Controller to find UNIT by id */
controller.findResourceByID = async (payload) => {
  const data = await unitService.findResourceByID(payload);
  return responseHelper.createSuccessResponse(MESSAGES.UNIT.FETCH, data);
}

/** Controller to delete UNIT by id */
controller.deleteResource = async (payload) => {
  const data = await unitService.deleteResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.UNIT.DELETE, { data });
}

/** controller to update UNIT by ID */
controller.updateResource = async (payload) => {
  const data = await unitService.updateResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.UNIT.UPDATE, data);
}

module.exports = { unitController: controller }