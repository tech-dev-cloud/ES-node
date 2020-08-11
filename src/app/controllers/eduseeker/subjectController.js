const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { subjectService } = require('../../services');
let controller = {};

/** Controller to create Subject */
controller.createResource = async (payload) => {
  const data = await subjectService.createResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.SUBJECT.CREATE, { data })
};

/** Controller to find Subjects */
controller.findResource = async (payload) => {
  const data = await subjectService.findResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.SUBJECT.FETCH, data);
}

/** Controller to find Subject by id */
controller.findResourceByID = async (payload) => {
  const data = await subjectService.findResourceByID(payload);
  return responseHelper.createSuccessResponse(MESSAGES.SUBJECT.FETCH, { data });
}

/** Controller to delete Subject by id */
controller.deleteResource = async (payload) => {
  const data = await subjectService.deleteResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.SUBJECT.DELETE, { data });
}

/** controller to update Subject by ID */
controller.updateResource = async (payload) => {
  const data = await subjectService.updateResource(payload);
  return responseHelper.createSuccessResponse(MESSAGES.SUBJECT.UPDATE, { data });
}

module.exports = { subjectController: controller }