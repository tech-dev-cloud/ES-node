const {
  EMAIL_TYPES,
  MONGO_ERROR,
  USER_ROLE,
  LOGIN_TYPE,
  REGISTER_TYPE,
} = require('../../utils/constants');
const util = require('../../utils/utils');
const { UserModel, SessionModel } = require(`../../mongo-models`);
const commonFunctions = require('../../utils/commonFunctions');
const { User } = require('../../models/user');
const { authService } = require('../../services');
const logger = require('../../../config/winston');
const {
  SOMETHING_WENT_WRONG,
  DUPLICATE_ENTRY,
  INVALID_CREDENTIALS,
  EMAIL_NOT_FOUND,
  UNAUTHORIZED,
  SESSION_EXPIRE,
} = require('../../utils/errorCodes');

let controller = {
  userRegister: async (request, response) => {
    request.body.password = commonFunctions.hashPassword(request.body.password);
    request.body.email = request.body.email.toLowerCase();
    request.body.role = [USER_ROLE.STUDENT];
    const userExist = await authService.getUserByEmail(request.body.email);
    let resData;
    try {
      if (userExist && userExist.registerType == REGISTER_TYPE.subscribe) {
        request.body.registerType = REGISTER_TYPE.signup;
        resData = await authService.updateUser(userExist._id, request.body);
      } else {
        const user = new UserModel(request.body);
        resData = await user.save();
      }
    } catch (err) {
      if (err.code == MONGO_ERROR.DUPLICATE) {
        throw {
          ...DUPLICATE_ENTRY,
          message: DUPLICATE_ENTRY.message.replace('{{key}}', 'Account'),
        };
      } else {
        throw SOMETHING_WENT_WRONG;
      }
    }
    response.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: resData,
    });
  },
  userLogin: async (request, response) => {
    const user = await UserModel.findOne({
      email: request.body.email.toLowerCase(),
    }).lean();
    console.log(user);
    if (
      !user ||
      !commonFunctions.compareHash(request.body.password, user.password)
    ) {
      throw INVALID_CREDENTIALS;
    } else {
      if (
        request.headers.admin &&
        !user.role.includes(USER_ROLE.TEACHER) &&
        !user.role.includes(USER_ROLE.ADMIN)
      ) {
        throw UNAUTHORIZED;
      }
      let token = await authService.createUserSession(
        user,
        LOGIN_TYPE.EDUSEEKER,
        null
      );
      response.status(200).json({
        success: true,
        message: 'Login successfull',
        data: {
          accessToken: token,
          name: user.name,
          ...(user.profile_pic ? { profile_pic: user.profile_pic } : {}),
        },
      });
    }
  },
  forgotPassword: async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email }).lean();
    if (!user) {
      throw EMAIL_NOT_FOUND;
    } else {
      let expireTime = new Date();
      let resetPayload = {
        _id: user._id,
        expireTime: expireTime.setHours(expireTime.getHours() + 5),
      };
      // user.resetPasswordToken = commonFunctions.encryptJwt(resetPayload);
      await UserModel.updateOne(
        { email: request.body.email },
        {
          $set: {
            resetPasswordToken: commonFunctions.encryptJwt(resetPayload),
          },
        }
      );
      // await user.save();
      try {
        await util.sendEmailSES(user, EMAIL_TYPES.FORGOT_PASSWORD);
        response.status(200).json({
          success: true,
          message: 'Please check you email to reset password',
        });
      } catch (err) {
        console.log(err);
        throw UNAUTHORIZED;
      }
    }
  },
  resetTokenVerification: async (request, response) => {
    let user = await UserModel.findOne({
      resetPasswordToken: request.body.token,
    }).lean();
    if (!user) {
      throw SESSION_EXPIRE;
      // response.status(400).json({
      //   success: false,
      //   message: "Invalid Token"
      // })
    } else {
      let obj = commonFunctions.decryptJwt(user.resetPasswordToken);
      if (obj.expireTime < Date.now()) {
        throw SESSION_EXPIRE;
        // response.status(400).json({
        //   success: false,
        //   message: "Token expired"
        // })
      } else {
        let updateData = {
          password: commonFunctions.hashPassword(request.body.password),
          resetPasswordToken: null,
        };
        let data = await UserModel.findByIdAndUpdate(
          obj._id,
          { $set: updateData },
          { new: true }
        );
        response.status(200).json({
          success: true,
          message: 'Password rest successfully',
          data,
        });
      }
    }
  },
  logoutSession: async (request, response) => {
    await SessionModel.deleteOne({ _id: request.user._id });
    response.status(200).json({
      success: true,
      message: 'Logout successfully',
    });
  },
  socailLogin: async (request, response) => {
    let { email } = request.body;
    let existingUser = await UserModel.findOne({ email }).lean();
    let user = {};
    let userResponseData = {
      name: request.body.name,
      email,
      profile_pic: request.body.profile_pic,
    };
    try {
      if (!existingUser) {
        user = new User(request.body, request.body.login_type, request.body);
      } else {
        user = new User(existingUser, request.body.login_type, request.body);
        if (existingUser.registerType == REGISTER_TYPE.subscribe) {
          user.registerType = REGISTER_TYPE.signup;
        }
      }
      UserModel.findOneAndUpdate({ email }, user, { upsert: true, new: true })
        .then(async (saved_user) => {
          userResponseData['accessToken'] = await authService.createUserSession(
            saved_user.toObject(),
            request.body.login_type,
            null
          );
          response.status(200).json({
            success: true,
            message: 'User created successfully',
            data: userResponseData,
          });
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      logger.err(err);
      throw SOMETHING_WENT_WRONG;
    }
  },
};

module.exports = { authController: controller };
