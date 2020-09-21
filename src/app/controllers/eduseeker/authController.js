const { authService } = require('../../services');
const MESSAGE = require('../../utils/messages');
const responseHelper = require('../../utils/responseHelper');

let controller = {}

controller.userRegister = async (payload) => {
  const data = await authService.userRegister(payload);
  return responseHelper.createSuccessResponse(MESSAGE.LOGGED_IN_SUCCESSFULLY, { data })
}

controller.userLogin = async (payload) => {
  const data = await authService.userLogin(payload);
  return responseHelper.createSuccessResponse(MESSAGE.LOGGED_IN_SUCCESSFULLY, data);
}

controller.forgotPassword = async (payload) => {
  const data = await authService.forgotPassword(payload)
  return responseHelper.createSuccessResponse(MESSAGE.LOGGED_IN_SUCCESSFULLY, { data });

}

controller.resetTokenVerification = async (payload) => {
  const data = await authService.resetPassword(payload);
  return responseHelper.createSuccessResponse(MESSAGE.LOGGED_IN_SUCCESSFULLY, { data });
}

controller.logoutSession = async (payload) => {
  const data = await authService.logoutSession(payload);
  return responseHelper.createSuccessResponse(MESSAGE.USER.LOGGED_OUT_SUCCESSFULLY, { data });
}

controller.resetPassword = async (payload) => {

}

module.exports = { authController: controller };