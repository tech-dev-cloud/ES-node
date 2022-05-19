const HTTPResponse = require('../../HTTPResponse/http-response');
const messages = require('../../utils/messages');
const { registerType } = require('./user-constant');
const service = require('./user-service');

const controller = {
  createUser: async (req, res) => {
    req.body['registerType'] = registerType.simpleLogin;
    await service.createUser(req.body);
    HTTPResponse.success(res, null, messages.USER.SIGNUP);
  },
  userLogin: async (req, res) => {
    const data = await service.userLogin(req.body);
    HTTPResponse.success(res, data);
  },
  verifyEmail: async (req, res) => {
    const { authorization } = req.headers;
    await service.verifyEmail(authorization);
    HTTPResponse.success(res);
  },
  verifyOTP: async (req, res) => {
    const { authorization } = req.headers;
    const { otp } = req.body;
    const accessToken = await service.verifyOTP(otp, authorization, req.user);
    HTTPResponse.success(res, { accessToken });
  },
  sendOTP: async (req, res) => {
    const { authorization } = req.headers;
    await service.sendOTP(req.user, authorization);
    HTTPResponse.success(res, null);
  },
};

module.exports = controller;
