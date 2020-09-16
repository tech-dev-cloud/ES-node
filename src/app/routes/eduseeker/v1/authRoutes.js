const JOI = require('joi');
const {USER_ROLE}=require('../../../utils/constants');
const { authController } = require('../../../controllers');

const routes = [
  {
    path: '/register',
    method: 'POST',
    joiSchemaForSwagger: {
      body: JOI.object({
        name: JOI.string().required().description('User name'),
        role: JOI.number().valid([1, 2]).required(),
        email: JOI.string().email().required().description('User email for registration'),
        phoneNumber: JOI.string().optional('Phone number'),
        password: JOI.string().description('Password')
      }),
      group: 'Authentication',
      description: 'Api to register user',
      model: 'RegisterUser'
    },
    handler: authController.userRegister
  },
  {
    path: '/login',
    method: 'POST',
    joiSchemaForSwagger: {
      body: {
        deviceToken: JOI.string(),
        email: JOI.string().email().required(),
        password: JOI.string().required()
      },
      group: 'Authentication',
      description: 'Api to login',
      model: 'UserLogin'
    },
    handler: authController.userLogin
  },
  {
    path: '/forgot-password',
    method: 'POST',
    joiSchemaForSwagger: {
      body: {
        email: JOI.string().email().required().description('User registered email'),
      },
      group: 'Authentication',
      description: 'Api to forgot-passwod',
      model: 'ForgotPassword'
    },
    handler: authController.forgotPassword
  },
  {
    path: '/verify-reset-token',
    method: 'POST',
    joiSchemaForSwagger: {
      body: {
        token: JOI.string().required(),
        password: JOI.string().required()
      },
      group: 'Authentication',
      description: 'Api to rest password',
      model: 'ResetPassword'
    },
    handler: authController.resetTokenVerification
  },
  {
    path: '/logout',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      group: 'Authentication',
      description: 'Api to logout password',
      model: 'logout'
    },
    auth: [USER_ROLE.TEACHER, USER_ROLE.STUDENT, USER_ROLE.ADMIN],
    handler: authController.logoutSession
  }
];

module.exports = routes;
