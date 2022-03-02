'use strict';

const BCRYPT = require('bcrypt');
const fs = require('fs');
const CONFIG = require('../../config/config');
// const transporter = require('nodemailer').createTransport(CONFIG.Development.NODE_MAILER.transporter);
const JWT = require('jsonwebtoken');
const handleBar = require('handlebars');
const { aws } = require('../services/aws');
const path = require('path');

//apiKeys for Mailjet
const CONSTANTS = require('../utils/constants');

let utils = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString
 */
utils.hashPassword = (payloadString) => {
  return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText
 * @param {string} hash
 */
utils.compareHash = (payloadPassword, userPassword) => {
  return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * Send emaildetails object in params
 * @param {*} email
 */
utils.sendEmailSES = (user, type) => {
  /* Todo - setup email data with unicode symbols */
  const mailData = utils.emailTypes(user, type);
  const source = fs
    .readFileSync(path.resolve(mailData.template), 'utf8')
    .toString();
  const template = handleBar.compile(source);

  const content = template(mailData.data);
  const obj = {
    Destination: {
      ToAddresses: [user.email],
    },
    Source: 'no-reply@eduseeker.in',
    Message: {
      Body: {
        Html: { Data: content },
      },
      Subject: {
        Data: mailData.Subject,
      },
    },
  };
  return aws.sendEmail(obj);
};
utils.sendEmail = () => {};

utils.emailTypes = (user, type) => {
  const EmailStatus = {
    Subject: '',
    data: {},
    template: '',
  };

  switch (type) {
    case CONSTANTS.EMAIL_TYPES.REGISTER_USER:
      EmailStatus.Subject = CONSTANTS.EMAIL_STATUS.SIGNUP;
      EmailStatus.template = CONSTANTS.EMAIL_TEMPLATE.REGISTER_USER;
      break;
    case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD:
      EmailStatus.Subject = CONSTANTS.EMAIL_STATUS.FORGOT_PASSWORD;
      EmailStatus.template = CONSTANTS.EMAIL_TEMPLATE.FORGOT_PASSWORD;
      EmailStatus.data['fullName'] = user.name;
      EmailStatus.data[
        'resetPasswordLink'
      ] = `https://eduseeker.in/reset-password/${user.resetPasswordToken}`;
      break;
    case CONSTANTS.EMAIL_TYPES.NEW_LAUNCH:
      EmailStatus.Subject = CONSTANTS.EMAIL_STATUS.FORGOT_PASSWORD;
      EmailStatus.template = CONSTANTS.EMAIL_TEMPLATE.FORGOT_PASSWORD;
      break;
    case CONSTANTS.EMAIL_TYPES.OFFER_LAUNCH:
      EmailStatus.Subject = CONSTANTS.EMAIL_STATUS.FORGOT_PASSWORD;
      EmailStatus.template = CONSTANTS.EMAIL_TEMPLATE.FORGOT_PASSWORD;
      break;
    case CONSTANTS.EMAIL_TYPES.PURCHASE_THANKS:
      break;

    case CONSTANTS.EMAIL_TYPES.default:
      EmailStatus['Subject'] = 'Welcome Email!';
      break;
  }
  return EmailStatus;
};

/** create jsonwebtoken **/
utils.encryptJwt = (payload) => {
  return JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, {
    algorithm: 'HS256',
  });
};

utils.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, {
    algorithm: 'HS256',
  });
};

/**
 * function to create random string.
 */
utils.createRandomString = (length = 12) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (const i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = utils;
