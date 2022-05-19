const errors = {
  UserAlreadyExist: 'Account with this email already exist',
  InvalidCredentials: 'Invalid email or password',
  emailNotVerified: 'Please verify your register email',
  OTPSendLimitExceed: 'Try after {{ttl}} seconds',
  OTPAlreadySent: 'Try after {{ttl}} seconds',
  OTPExpired: 'OTP expired',
  InvalidOTP: 'Invalid OTP',
};
const errorCode = {
  emailNotVerified: 'email_not_verified',
  OTPSendLimitExceed: 'otp_sent_limit_exceed',
  OTPAlreadySent: 'otp_already_sent',
  OTPExpired: 'otp_expired',
  InvalidOTP: 'invalid_otp',
};
module.exports = { errors, errorCode };
