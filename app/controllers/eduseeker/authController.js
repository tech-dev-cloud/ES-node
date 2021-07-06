const { EMAIL_TYPES, MONGO_ERROR, USER_ROLE, LOGIN_TYPE } = require('../../utils/constants');
const util = require('../../utils/utils');
const { UserModel, SessionModel } = require(`../../mongo-models`);
const commonFunctions = require('../../utils/commonFunctions');
const { User } = require('../../models/user');
const { authService } = require('../../services');

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
        response.status(400).json({
          success: false,
          message: "Account already exist"
        })
      } else {
        response.status(500).json({
          success: false,
          message: "Something went wrong"
        })
      }
    }
  },
  userLogin: async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email.toLowerCase() }).lean();
    if (!user || !commonFunctions.compareHash(request.body.password, user.password)) {
      response.status(400).json({
        success: false,
        message: "Invalid credentials"
      })
    } else {
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
    }
  },
  forgotPassword: async (request, response) => {
    const user = await UserModel.findOne({ email: request.body.email });
    if (!user) {
      response.status(400).json({
        success: false,
        message: "Email does not exist"
      })
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
        response.status(500).json({
          success: false,
          message: "Something went wrong"
        })
      }
    }
  },
  resetTokenVerification: async (request, response) => {
    let user = await UserModel.findOne({ resetPasswordToken: request.body.token }).lean()
    if (!user) {
      response.status(400).json({
        success: false,
        message: "Invalid Token"
      })
    } else {
      let obj = commonFunctions.decryptJwt(user.resetPasswordToken);
      if (obj.expireTime < Date.now()) {
        response.status(400).json({
          success: false,
          message: "Token expired"
        })
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
    let user_responseData = {
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
      UserModel.findOneAndUpdate({ email }, user, { upsert: true, new: true }).then(async (saved_user) => {
        saved_user = saved_user.toObject()
        let token = await authService.createUserSession(saved_user, request.body.login_type, null);
        user_responseData['accessToken'] = token;
        response.status(200).json({
          success: true,
          message: 'User created successfully',
          data: user_responseData
        });
      });
    } catch (err) {
      console.log(err)
      response.status(500).json({
        success: true,
        message: 'Internal server error',
        debug: err
      });
    }

  }
}


module.exports = { authController: controller };