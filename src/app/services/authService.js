const { SECURITY, ERROR_TYPE, USER_ROLE, AVAILABLE_AUTHS, MONGO_ERROR } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const responseHelper = require("../utils/responseHelper")
const { SessionModel, UserModel } = require(`../models`);
const commonFunctions = require('../utils/commonFunctions')
const jwt = require("jsonwebtoken");

let authService = {};
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
    }).catch((err) => {
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
    // return request.headers.authorization === SECURITY.STATIC_TOKEN_FOR_AUTHORIZATION
    let authenticatedUser = await SessionModel.findOne({ accessToken: request.headers.authorization }).lean();
    if (authenticatedUser) {
      if (authType.some(role => role == authenticatedUser.role)) {
        request.user = authenticatedUser;
        return true;
      }
      return false;
    }
    return false;
  } catch (err) {
    return false;
  }
};

/**
 * function to validate user's token from samsung server if it is valid or not.
 */
authService.validateToken = async (token) => {
  // TODO call samsung server to validate if user's token is valid or not.
  let isValidToken = true;
  return isValidToken;
};

// authService.authentication = async (payload) => {
//   let tokenPayload = { key: payload._id, role: payload.role }

//   let userAgency;
//   if (payload.role == USER_ROLE.AGENCY) {
//     userAgency = await agencyService.getUserAgency({ userId: payload._id });
//     if (!userAgency) {
//       if (payload.socialId && payload.role == USER_ROLE.AGENCY) {
//         userAgency = await agencyService.newAgency({ createdBy: payload._id });
//       } else {
//         throw responseHelper.createErrorResponse(MESSAGES.USER.AGENCY_NOT_EXIST, ERROR_TYPE.BAD_REQUEST);
//       }
//     }
//     tokenPayload.agencyID = userAgency._id;
//   }
//   const token = await jwt.sign({ key: payload._id, role: payload.role }, SECURITY.JWT_SIGN_KEY, { expiresIn: '120ms' });
//   /** -- user can do multiple login */
//   let dataToUpdate = {
//     userId: payload._id,
//     role: payload.role,
//     token: token,
//     deviceToken: payload.deviceToken
//   }
//   if (userAgency) {
//     dataToUpdate.agencyID = userAgency._id;
//   }
//   await SessionModel.updateOne({
//     deviceToken: payload.deviceToken
//   },
//     { $set: dataToUpdate },
//     { upsert: true, setDefaultsOnInsert: true, new: true }
//   );
//   let response = { token };
//   if (userAgency) {
//     response.userAgency = userAgency;
//     response.agencyId = userAgency._id
//   }
//   return response;
// }

/**function to logout the user session */
authService.unauthentication = async (user) => {
  await SessionModel.deleteOne({ token: user.token });
  return true;
}

/**Function to register user */
authService.userRegister = async (payload) => {
  payload.password = commonFunctions.hashPassword(payload.password);
  const user = new UserModel(payload);
  try {
    return await user.save();
  } catch (err) {
    if (err.code == MONGO_ERROR.DUPLICATE) {
      throw responseHelper.createErrorResponse(ERROR_TYPE.BAD_REQUEST, MESSAGES.USER.EXIST);
    }
    throw err;
  }
}

/** Function to start user session if user is authenticated */
authService.userLogin = async (payload) => {
  const user = await UserModel.findOne({ email: payload.email }).lean();
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
  delete user.password;
  user.accessToken = session.accessToken;
  return user;
}

authService.forgotPassword = async (payload) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw responseHelper.createErrorResponseUND(MESSAGES.NO_USER_FOUND);
  }
  let expireTime = new Date();
  let resetPayload = {
    _id: user._id,
    expireTime: expireTime.setHours(expireTime.getHours() + 5)
  }
  user.resetPasswordToken = commonFunctions.encryptJwt(resetPayload);
  await user.save();
  util.sendEmailNodeMailer(user, EMAIL_TYPES.FORGOT_PASSWORD)
  // await sendMail(`http://locahost:4000/v1/verify-reset-token/${resetPasswordToken}`);
  console.log('email sent')
  return
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

authService.changePassword = async (payload) => {
  let _id = commonFunctions.decryptJwt(payload.token)._id;
  let updateData = { password: commonFunctions.hashPassword(payload.password), resetPasswordToken: null };
  let user = UserModel.findByIdAndUpdate(_id, { $set: updateData }, { new: true });
  return user;
}

authService.emailVerification = async (token) => {
  const id = commonFunctions.decryptJwt(token)._id;
  const user = await UserModel.findByIdAndUpdate(id, { $set: { emailVerificationStatus: true } }, { new: true }).lean();
  return user;
}
module.exports = { authService };