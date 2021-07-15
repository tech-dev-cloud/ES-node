const { EMAIL_TYPES, MONGO_ERROR, USER_ROLE, LOGIN_TYPE } = require('../../utils/constants');
const util = require('../../utils/utils');
const { UserModel, SessionModel } = require(`../../mongo-models`);
const commonFunctions = require('../../utils/commonFunctions');
const { User } = require('../../models/user');
const { authService } = require('../../services');
const logger = require('../../../config/winston');
const { SOMETHING_WENT_WRONG, DUPLICATE_ENTRY, INVALID_CREDENTIALS, EMAIL_NOT_FOUND, UNAUTHORIZED, SESSION_EXPIRE } = require('../../utils/errorCodes');

let controller = {
  userRegister: async (request, response) => {
    request.body.password = commonFunctions.hashPassword(request.body.password);
    request.body.email = request.body.email.toLowerCase();
    request.body.role = [USER_ROLE.STUDENT];
    const user = new UserModel(request.body);
    try {
      let data = await user.save();
      response.status(200).json({
        success: true,
        message: "User registered successfully",
        data
      })
    } catch (err) {
      if (err.code == MONGO_ERROR.DUPLICATE) {
        throw {...DUPLICATE_ENTRY, message:DUPLICATE_ENTRY.message.replace('{{key}}', 'Account')}
        // response.status(400).json({
        //   success: false,
        //   message: "Account already exist"
        // })
      } else {
        throw SOMETHING_WENT_WRONG
        // response.status(SOMETHING_WENT_WRONG).json({
        //   success: false,
        //   message: "Something went wrong"
        // })
      }
    }
  },
  userLogin: async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email.toLowerCase() }).lean();
    if (!user || !commonFunctions.compareHash(request.body.password, user.password)) {
      throw INVALID_CREDENTIALS;
      // response.status(400).json({
      //   success: false,
      //   message: "Invalid credentials"
      // })
    } else {
      try{
        let token = await authService.createUserSession(user, LOGIN_TYPE.EDUSEEKER, null);
        response.status(200).json({
          success: true,
          message: "Login successfull",
          data: {
            accessToken: token,
            name: user.name,
            ...(user.profile_pic ? { profile_pic: user.profile_pic } : {})
          }
        })
      }catch(err){
        throw err
      }
    }
  },
  forgotPassword: async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email });
    if (!user) {
      throw EMAIL_NOT_FOUND;
      // response.status(400).json({
      //   success: false,
      //   message: "Email does not exist"
      // })
    } else {
      let expireTime = new Date();
      let resetPayload = {
        _id: user._id,
        expireTime: expireTime.setHours(expireTime.getHours() + 5)
      }
      user.resetPasswordToken = commonFunctions.encryptJwt(resetPayload);
      await user.save();
      try {
        await util.sendEmailSES(user, EMAIL_TYPES.FORGOT_PASSWORD);
        response.status(200).json({
          success: true,
          message: "Please check you email to reset password"
        })
      } catch (err) {
        throw UNAUTHORIZED;
        // response.status(500).json({
        //   success: false,
        //   message: "Something went wrong"
        // })
      }
    }
  },
  resetTokenVerification: async (request, response) => {
    let user = await UserModel.findOne({ resetPasswordToken: request.body.token }).lean()
    if (!user) {
      throw SESSION_EXPIRE
      // response.status(400).json({
      //   success: false,
      //   message: "Invalid Token"
      // })
    } else {
      let obj = commonFunctions.decryptJwt(user.resetPasswordToken);
      if (obj.expireTime < Date.now()) {
        throw SESSION_EXPIRE
        // response.status(400).json({
        //   success: false,
        //   message: "Token expired"
        // })
      } else {
        let updateData = { password: commonFunctions.hashPassword(request.body.password), resetPasswordToken: null };
        let data = await UserModel.findByIdAndUpdate(obj._id, { $set: updateData }, { new: true });
        response.status(200).json({
          success: true,
          message: "Password rest successfully",
          data
        })
      }
    }
  },
  logoutSession: async (request, response) => {
    await SessionModel.deleteOne({ _id: request.user._id });
    response.status(200).json({
      success: true,
      message: "Logout successfully",
    })
  },
  socailLogin: async (request, response) => {
    let { email } = request.body;
    let existingUser = await UserModel.findOne({ email }).lean();
    let user = {};
    let userResponseData = {
      name: request.body.name,
      email,
      profile_pic: request.body.profile_pic
    };
    try {
      if (!existingUser) {
        user = new User(request.body, request.body.login_type, request.body);
      } else {
        user = new User(existingUser, request.body.login_type, request.body);
      }
      UserModel.findOneAndUpdate({ email }, user, { upsert: true, new: true })
      .then(async (saved_user) => {
        userResponseData['accessToken'] = await authService.createUserSession(saved_user.toObject(), request.body.login_type, null);
        response.status(200).json({
          success: true,
          message: 'User created successfully',
          data: userResponseData
        });
      }).catch(err=>{
        throw err;
      });
    } catch (err) {
      logger.err(err);
      throw SOMETHING_WENT_WRONG;
    }

  }
}


module.exports = { authController: controller };