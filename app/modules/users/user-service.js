const HTTPResponse = require('../../HTTPResponse/http-response');
const db = require('../../models');
const RedisWrapper = require('../../utils/redis-util');
const utils = require('../../utils/utils');
const { registerType, userSessionType } = require('./user-constant');
const params = require('../../../config/env/development_params.json');
const Email = require('../notification/email-service');
const { EMAIL_VERIFICATION, OTP_TYPE } = require('../../utils/server-constant');
const { errors, errorCode } = require('../../HTTPResponse/error-message');
const OTPUtil = require('../../utils/otp-utils');
const Solr = require('../solr/solr-service');
const { UserModel } = require('../../mongo-models');

const service = {
  createUser: async (userData) => {
    // let user = await db.sequelize.query('select id from users where email=?', {
    //   replacements: [userData.email],
    //   type: db.sequelize.QueryTypes.SELECT,
    // });
    const user = await UserModel.findOne({ email: userData.email }).lean();
    if (user) {
      throw HTTPResponse.Duplicate(errors.UserAlreadyExist);
    }
    if (userData.registerType == registerType.simpleLogin) {
      userData.password = utils.hashPassword(userData.password);
    }
    // const newUser = await db.users.create(userData);
    const newUser = await new UserModel(userData).save();
    // const dataToSave = { user_id: newUser.dataValues.id, ...userData };
    // const profileData = await db.profile.create(dataToSave);
    // user = { ...newUser.dataValues, ...profileData.dataValues };
    return sendEmailVerification(newUser);
    // const solr = new Solr();
    // return solr.syncUser(user);
  },
  userLogin: async (data) => {
    const user = await UserModel.findOne({ email: data.email }).lean();
    if (user && utils.compareHash(data.password, user.password)) {
      // const userProfile = await db.sequelize.query(
      //   'select * from profile where user_id=?',
      //   {
      //     replacements: [user.id],
      //     type: db.sequelize.QueryTypes.SELECT,
      //   }
      // );
      // user = { ...user.dataValues, ...userProfile[0] };
      const accessToken = await createUserSession(
        user,
        userSessionType.preLogin
      );
      if (!user.emailVerified) {
        throw HTTPResponse.Forbidden(
          errors.emailNotVerified,
          errorCode.emailNotVerified,
          { accessToken }
        );
      } else {
        // Send OTP
        const otpObj = new OTPUtil();
        otpObj.sendOTP(OTP_TYPE.login, user, accessToken);
        return { accessToken };
      }
    }
    throw HTTPResponse.BadRequest(errors.InvalidCredentials);
  },
  verifyEmail: async (token) => {
    const data = await RedisWrapper.get(params.emailVerifySession + token);
    if (!data || data == 'nil') {
      throw HTTPResponse.UnAuthorize();
    }
    await UserModel.findOneAndUpdate(
      { emailVerificationToken: token },
      { emailVerified: true }
    );
    // await db.sequelize.query(
    //   'UPDATE profile set email_verified="1", email_verification_token=null where email_verification_token=?',
    //   {
    //     replacements: [token],
    //     type: db.sequelize.QueryTypes.UPDATE,
    //   }
    // );
  },
  verifyOTP: async (otp, token, user) => {
    const otpObj = new OTPUtil();
    const data = await otpObj.isValidOtp(
      OTP_TYPE.login,
      user.user_id,
      token,
      otp
    );
    if (!data) {
      throw HTTPResponse.Forbidden(errors.InvalidOTP, errorCode.InvalidOTP);
    }
    const userData = await UserModel.findOne({ _id: user.user_id });
    // const userData = await db.sequelize.query(
    //   'select u.id, u.email, p.name, p.phone_number,p.mobile_verified, p.email_verified from users u inner join profile p on u.id=p.user_id where u.id=?',
    //   {
    //     replacements: [user.user_id],
    //     type: db.sequelize.QueryTypes.SELECT,
    //   }
    // );
    const preSessionKey = `${params.preUserAuthentication}${user.user_id}_${token}`;
    OTPUtil.flushSession(OTP_TYPE.login, user.user_id, token);
    RedisWrapper.del(preSessionKey);

    return createUserSession(userData, userSessionType.postLogin);
  },
  sendOTP: async (user, token) => {
    const otpObj = new OTPUtil();
    return otpObj.sendOTP(OTP_TYPE.login, user, token);
  },
};

/**
 * @param {*} user
 * @returns Promise of send verification Email call
 */
async function sendEmailVerification(user) {
  const token = utils.encryptJwt({ email: user.email });
  await Promise.all([
    UserModel.findOneAndUpdate(
      { _id: user._id },
      { emailVerificationToken: token }
    ),
    // db.sequelize.query(
    //   'UPDATE profile set email_verification_token=? where user_id=?',
    //   {
    //     replacements: [token, user.id],
    //     type: db.sequelize.QueryTypes.UPDATE,
    //   }
    // ),
    RedisWrapper.save(
      params.emailVerifySession + token,
      token,
      params.emailVerifySessionExpire
    ),
  ]);
  const email = new Email();
  return email.verificationEmail(user, token);
}
/**
 * @param {*} user
 * @param {*} sessionType PreLogin = 1 | PostLogin = 2
 * @returns  accessToken
 */
async function createUserSession(user, sessionType) {
  const userId = user._id.toString();
  const userSessionData = {
    user_id: userId,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    mobileVerified: user.mobileVerified,
    emailVerified: user.emailVerified,
  };
  const accessToken = utils.encryptJwt({ id: userId });
  let sessionKey;
  if (sessionType === userSessionType.preLogin) {
    sessionKey = `${params.preUserAuthentication}${userId}_`;
  } else {
    sessionKey = `${params.userAuthentication}${userId}_`;
  }
  RedisWrapper.delByPattern(`${sessionKey}*`);
  await RedisWrapper.save(
    sessionKey + accessToken,
    userSessionData,
    params.userAuthenticationExpire
  );
  return accessToken;
}

module.exports = service;
