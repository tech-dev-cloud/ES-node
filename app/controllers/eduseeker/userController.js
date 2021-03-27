const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');
const { userService } = require('../../services');

let controller = {};

controller.findUserProducts = async (payload) => {
  const data = await userService.findUserProducts(payload);
  return data;
}

module.exports = { userController: controller }