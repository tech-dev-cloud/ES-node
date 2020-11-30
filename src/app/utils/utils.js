'use strict';

const BCRYPT = require('bcrypt');
const fs = require('fs');
const CONFIG = require('../../config/config');
// const transporter = require('nodemailer').createTransport(CONFIG.Development.NODE_MAILER.transporter);
const JWT = require('jsonwebtoken');
const handleBar = require('handlebars');
const {aws}=require('../services/aws');
const path=require('path');


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
    console.log(path.resolve(mailData.template))
    let source=fs.readFileSync(path.resolve(mailData.template), 'utf8').toString();
    let template = handleBar.compile(source);

    let content = template(mailData.data);
    let obj={ 
      Destination:{
        ToAddresses:[user.email]
      },
      Source:"theeduseeker@gmail.com",
      Message:{
        Body:{
          Html:{Data:content}
        },
        Subject:{
          Data:mailData.Subject
        }
      }
    }
    // let mailOptions = {
    //   from: CONFIG.Development.NODE_MAILER.sender,
    //   to: user.email,
    //   subject: mailData.Subject,
    //   html: content
    // };

    /* Todo - send mail with defined transport object */
    return aws.sendEmail(obj);
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log('Message error: ', error);
    //     reject(error);
    //   }
    //   console.log('Message sent: %s', (info || {}).messageId);
    //   resolve(null);
    // });
};

utils.emailTypes = (user, type) => {
  let EmailStatus = {
    Subject: '',
    data: {},
    template: ''
  };

  switch (type) {
    case CONSTANTS.EMAIL_TYPES.REGISTER_USER:
      EmailStatus.Subject = CONSTANTS.EMAIL_STATUS.SIGNUP;
      EmailStatus.template = CONSTANTS.EMAIL_TEMPLATE.REGISTER_USER;
      // EmailStatus.data['password'] = userObject.password;
      break;
    case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD:
      EmailStatus.Subject = CONSTANTS.EMAIL_STATUS.FORGOT_PASSWORD;
      EmailStatus.template = CONSTANTS.EMAIL_TEMPLATE.FORGOT_PASSWORD;
      EmailStatus.data['fullName'] = user.name;
      EmailStatus.data['resetPasswordLink'] = `https://eduseeker.in/reset-password/${user.resetPasswordToken}`;
      break;
    default:
      EmailStatus['Subject'] = 'Welcome Email!';
      break;

  }
  // EmailStatus.data['fullName'] = user.userName;
  return EmailStatus;
};


/** create jsonwebtoken **/
utils.encryptJwt = (payload) => {
  let token = JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' });
  return token;
};

utils.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
};

/**
 * function to create random string.
 */
utils.createRandomString = (length = 12) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = utils;
