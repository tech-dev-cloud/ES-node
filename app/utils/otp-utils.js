const RedisWrapper = require('./redis-util');
const params = require('../../config/env/development_params.json');
const HTTPResponse = require('../HTTPResponse/http-response');
const { errors, errorCode } = require('../HTTPResponse/error-message');
const Email = require('../modules/notification/email-service');

class OTPUtil {
  generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  async canSendOTP(otpType, userId, token) {
    const lastOTPSend = `${params.newOTPSend}${otpType}${userId}_${token}`;
    const OTPSendBlockKey = `${params.OTPSendBlock}${otpType}${userId}_${token}`;
    const OTPAttemptKey = `${params.OTPAttempt}${otpType}${userId}_${token}`;
    const [lastOTPSentTTL, sentOTPBlockedTTL, OTPAttempt] = await Promise.all([
      RedisWrapper.ttl(lastOTPSend),
      RedisWrapper.ttl(OTPSendBlockKey),
      RedisWrapper.get(OTPAttemptKey),
    ]);
    if (sentOTPBlockedTTL > 0) {
      const errorMeta = { seconds: sentOTPBlockedTTL };
      const err = errors.OTPSendLimitExceed.replace(
        '{{ttl}}',
        sentOTPBlockedTTL
      );
      throw HTTPResponse.BadRequest(
        err,
        errorCode.OTPSendLimitExceed,
        errorMeta
      );
    } else if (lastOTPSentTTL > 0) {
      const errorMeta = { seconds: lastOTPSentTTL };
      const err = errors.OTPAlreadySent.replace('{{ttl}}', lastOTPSentTTL);
      throw HTTPResponse.BadRequest(err, errorCode.OTPAlreadySent, errorMeta);
    } else if (OTPAttempt >= 5) {
      const errorMeta = { seconds: params.OTPBlockExpire };
      const err = errors.OTPSendLimitExceed.replace(
        '{{ttl}}',
        sentOTPBlockedTTL
      );
      RedisWrapper.save(OTPSendBlockKey, token, params.OTPBlockExpire);
      throw HTTPResponse.BadRequest(
        err,
        errorCode.OTPSendLimitExceed,
        errorMeta
      );
    }
    return {
      otpSentAttempt: OTPAttempt ? parseInt(OTPAttempt) : 0,
    };
  }

  async sendOTP(otpType, user, token) {
    const data = await this.canSendOTP(otpType, user.user_id, token);
    const otp = this.generateOtp();
    const emailObj = new Email();
    await emailObj.OTPVerificationEmail(otp, otpType, user.email);

    const OTPKey = `${params.OTP}${otpType}${user.user_id}_`;
    const OTPAttemptKey = `${params.OTPAttempt}${otpType}${user.user_id}_`;
    const newOTPSend = `${params.newOTPSend}${otpType}${user.user_id}_`;

    RedisWrapper.delByPattern(`${OTPKey}*`);
    // RedisWrapper.delByPattern(`${OTPAttemptKey}*`);
    RedisWrapper.delByPattern(`${newOTPSend}*`);

    RedisWrapper.save(newOTPSend + token, 'true', params.newOTPSendExpire);
    RedisWrapper.save(OTPKey + token, otp, params.loginOTPExpire);
    RedisWrapper.save(
      OTPAttemptKey + token,
      data.otpSentAttempt + 1,
      params.loginOTPExpire
    );
  }

  async isValidOtp(otpType, userId, token, userOTP) {
    const OTPKey = `${params.OTP}${otpType}${userId}_${token}`;
    const data = await RedisWrapper.get(OTPKey);
    if (!data || data == 'nil') {
      throw HTTPResponse.Forbidden(errors.OTPExpired, errorCode.OTPExpired);
    }
    return data == userOTP;
  }

  static async flushSession(otpType, userId, token) {
    const OTPKey = `${params.OTP}${otpType}${userId}_${token}`;
    const OTPSendBlockKey = `${params.OTPSendBlock}${otpType}${userId}_${token}`;
    const OTPAttemptKey = `${params.OTPAttempt}${otpType}${userId}_${token}`;
    return Promise.all([
      RedisWrapper.del(OTPKey),
      RedisWrapper.del(OTPSendBlockKey),
      RedisWrapper.del(OTPAttemptKey),
    ]);
  }
}

module.exports = OTPUtil;
