const { EMAIL_TYPES, ERROR_TYPE, MONGO_ERROR, USER_ROLE } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const responseHelper = require("../utils/responseHelper");
const { SessionModel, UserModel } = require(`../mongo-models`);
const commonFunctions = require('../utils/commonFunctions');
const util = require('../utils/utils');
const mongoose = require('mongoose');
const config = require('../../config/config');
const { UNAUTHORIZED, DEVICE_LOGIN_LIMIT_EXCEED } = require('../utils/errorCodes');
let params = require(`../../config/env/${config.NODE_ENV}_params.json`);

let authService = {
  createUserSession: async (user, login_type, deviceToken) => {
    let tokenPayload = {
      role: user.role,
      id: user._id
    }
    const accessToken = commonFunctions.encryptJwt(tokenPayload);
    let sessionPayload = {
      userId: user._id,
      accessToken,
      deviceToken: deviceToken,
      role: user.role,
      loginType: login_type
    }
    const userActiveSession = await SessionModel.find({ userId: user._id }).lean();
    if (userActiveSession && userActiveSession.length >= params.userSessionLimit) {
      // const expiredSessionIds = userActiveSession.map(session => session._id);
      // expiredSessionIds.splice(expiredSessionIds.length - 1, 1);
      // SessionModel.deleteMany({ _id: { $in: expiredSessionIds } }).then(res => {
      //   console.log("done")
      // });
      throw DEVICE_LOGIN_LIMIT_EXCEED;
    }
    session = await (new SessionModel(sessionPayload).save());
    return session.accessToken;
  }
};
/**
 * function to authenticate user.
 */
authService.userValidate = (authType) => {
  return (request, response, next) => {
    validateUser(request, authType).then((isAuthorized) => {
      if (isAuthorized) {
        return next();
      }
      let responseObject = responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED, MESSAGES.USER.UNAUTHORIZED);
      return response.status(responseObject.statusCode).json(responseObject);
    }).catch(() => {
      let responseObject = responseHelper.createErrorResponse(ERROR_TYPE.UNAUTHORIZED, MESSAGES.USER.UNAUTHORIZED);
      return response.status(responseObject.statusCode).json(responseObject);
    });
  };
};


/**
 * function to validate user's jwt token and fetch its details from the system. 
 * @param {} request 
 */
let validateUser = async (request, authType) => {
  try {
    if (request.headers.authorization) {
      let authenticatedUser = await SessionModel.findOne({ accessToken: request.headers.authorization }).lean();
      if (authenticatedUser) {
        if (authType && authType.length) {
          if (authType.some(role => authenticatedUser.role.includes(role)) || authenticatedUser.role[0] == 0) {
            request.user = await UserModel.findOne({ _id: authenticatedUser.userId }).lean();
          } else {
            return false;
          }
        } else {
          request.user = await UserModel.findOne({ _id: mongoose.Types.ObjectId(params.default_user) }).lean();
        }
      } else {
        return false;
      }
    } else {
      request.user = await UserModel.findOne({ _id: mongoose.Types.ObjectId(params.default_user) }).lean();
    }
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * function to validate user's token from samsung server if it is valid or not.
 */
authService.validateToken = async () => {
  // TODO call samsung server to validate if user's token is valid or not.
  let isValidToken = true;
  return isValidToken;
};


/**function to logout the user session */
authService.unauthentication = async (user) => {
  await SessionModel.deleteOne({ token: user.token });
  return true;
}

/**Function to register user */
authService.userRegister = async (payload) => {
  payload.password = commonFunctions.hashPassword(payload.password);
  payload.email = payload.email.toLowerCase();
  if (payload.web_app) {
    payload.role = [USER_ROLE.STUDENT]
  }
  const user = new UserModel(payload);
  try {
    await user.save();
  } catch (err) {
    if (err.code == MONGO_ERROR.DUPLICATE) {
      throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.USER.EXIST);
    }
    throw err;
  }
}

/** Function to start user session if user is authenticated */
authService.userLogin = async (payload) => {
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() }).lean();
  if (!user) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.USER.NO_USER_FOUND);
  }
  // If password matched
  if (!commonFunctions.compareHash(payload.password, user.password)) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.USER.INVALID_CREDENTIALS)
  }

  let tokenPayload = {
    role: user.role,
    id: user._id
  }
  const accessToken = commonFunctions.encryptJwt(tokenPayload);
  // Start user session
  let sessionPayload = {
    userId: user._id,
    accessToken,
    deviceToken: payload.deviceToken,
    role: user.role
  }
  let session;
  if (payload.deviceToken) {
    session = await SessionModel.findOneAndUpdate({ deviceToken: payload.deviceToken }, sessionPayload, { upsert: true, new: true }).lean();
  } else {
    session = await (new SessionModel(sessionPayload).save());
  }
  let response = {
    accessToken: session.accessToken,
    name: user.name
  }
  return response;
}

authService.forgotPassword = async (payload) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw responseHelper.createErrorResponse(MESSAGES.NO_USER_FOUND);
  }
  let expireTime = new Date();
  let resetPayload = {
    _id: user._id,
    expireTime: expireTime.setHours(expireTime.getHours() + 5)
  }
  user.resetPasswordToken = commonFunctions.encryptJwt(resetPayload);
  await user.save();
  try {
    await util.sendEmailSES(user, EMAIL_TYPES.FORGOT_PASSWORD);
    return "Please check you email to reset password"
  } catch (err) {
    console.error(err);
    return false;
  }
}



authService.isValidResetPasswordLink = async (payload) => {
  try {
    let decoded = commonFunctions.decryptJwt(payload.resetPasswordToken);
    let user = await UserModel.findById(decoded._id).lean();
    if (user && user.resetPasswordToken) {
      return true;
    }
    return false;
  } catch (error) {
    return false
  }
}

authService.resetPassword = async (payload) => {
  let user = await UserModel.findOne({ resetPasswordToken: payload.token }).lean()
  if (!user) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.INVALID_TOKEN);
  }
  let obj = commonFunctions.decryptJwt(user.resetPasswordToken);
  if (obj.expireTime < Date.now()) {
    throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.INVALID_TOKEN);
  }
  let updateData = { password: commonFunctions.hashPassword(payload.password), resetPasswordToken: null };
  let data = UserModel.findByIdAndUpdate(obj._id, { $set: updateData }, { new: true });
  return data;
}

authService.emailVerification = async (token) => {
  const id = commonFunctions.decryptJwt(token)._id;
  const user = await UserModel.findByIdAndUpdate(id, { $set: { emailVerificationStatus: true } }, { new: true }).lean();
  return user;
}

authService.logoutSession = async (payload) => {
  return await SessionModel.deleteOne({ _id: payload.user._id });
}
module.exports = { authService };
