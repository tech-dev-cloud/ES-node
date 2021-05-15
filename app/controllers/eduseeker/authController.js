const { EMAIL_TYPES, MONGO_ERROR, USER_ROLE } = require('../../utils/constants');
const util = require('../../utils/utils');
const { UserModel, SessionModel } = require(`../../mongo-models`);
const commonFunctions = require('../../utils/commonFunctions');

let controller = {
  userRegister: async (request, response) => {
    request.body.password = commonFunctions.hashPassword(request.body.password);
    request.body.email = request.body.email.toLowerCase();
    request.body.role = [USER_ROLE.STUDENT];
    // if(request.headers.web_app){
    // }
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
      let tokenPayload = {
        role: user.role,
        id: user._id
      }
      const accessToken = commonFunctions.encryptJwt(tokenPayload);
      let sessionPayload = {
        userId: user._id,
        accessToken,
        deviceToken: request.body.deviceToken,
        role: user.role
      }
      let session;
      if (request.body.deviceToken) {
        session = await SessionModel.findOneAndUpdate({ deviceToken: request.body.deviceToken }, sessionPayload, { upsert: true, new: true }).lean();
      } else {
        session = await (new SessionModel(sessionPayload).save());
      }
      response.status(200).json({
        success: true,
        message: "Login successfull",
        data: {
          accessToken: session.accessToken,
          name: user.name
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
  }
}


module.exports = { authController: controller };