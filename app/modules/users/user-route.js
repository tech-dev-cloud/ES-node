const Joi = require('joi');
const { userSessionType } = require('./user-constant');
const controller = require('./user-controller');

const routes = [
  {
    path: '/users/signup',
    method: 'POST',
    joiSchemaForSwagger: {
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        password: Joi.string().required(),
      }),
      group: 'Users',
      description: 'Api to register user',
      model: 'UserSignup',
    },
    version: 'v1',
    handler: controller.createUser,
  },
  {
    path: '/users/login',
    method: 'POST',
    joiSchemaForSwagger: {
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
      group: 'Users',
      description: 'Api to login user',
      model: 'UserLogin',
    },
    version: 'v1',
    handler: controller.userLogin,
  },
  {
    path: '/users/email-verify',
    method: 'POST',
    joiSchemaForSwagger: {
      header: Joi.object({
        authorization: Joi.string().required(),
      }),
      group: 'Users',
      description: 'Email verification API',
      model: 'EmailVerification',
    },
    version: 'v1',
    authType: userSessionType.preLogin,
    handler: controller.verifyEmail,
  },
  {
    path: '/users/login-otp-verify',
    method: 'POST',
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }),
      body: {
        otp: Joi.string().required(),
      },
      group: 'Users',
      description: 'OTP verification API',
      model: 'OTPVerification',
    },
    version: 'v1',
    authType: userSessionType.preLogin,
    handler: controller.verifyOTP,
  },
  {
    path: '/users/send-otp',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }),
      group: 'Users',
      description: 'API to resend OTP',
      model: 'ResendOTP',
    },
    version: 'v1',
    authType: userSessionType.preLogin,
    handler: controller.sendOTP,
  },
];
module.exports = routes;
