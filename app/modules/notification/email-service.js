const fs = require('fs');
const handleBar = require('handlebars');
const path = require('path');
const moment = require('moment');
const {
  EMAIL_TYPE,
  EMAIL_TEMPLATE,
  PRODUCTS_TYPE,
  REDIRECTION_URL,
} = require('../../utils/constants');
const { aws } = require('../../services/aws');
const { EMAIL_SUBJECTS } = require('./notification-constants');
module.exports = class Email {
  constructor(obj) {
    if (obj) {
      this.subject = obj.subject;
      this.template = obj.template;
      this.type = obj.type;
    }
    this.data = {};
  }
  sendEmail(email) {
    const template = handleBar.compile(this.template);
    const content = template(this.data);
    // if (process.env.NODE_ENV == 'development') {
    //   email = 'tamit9509@gmail.com';
    // }
    const obj = {
      Destination: {
        ToAddresses: [email],
      },
      Source: 'Eduseeker<theeduseeker@gmail.com>',
      Message: {
        Body: {
          Html: { Data: content },
        },
        Subject: {
          Data: this.subject,
        },
      },
    };
    return aws.sendEmail(obj);
  }
  mapKeys(user) {
    switch (this.type) {
      case EMAIL_TYPE.LAUNCH:
        this.data['username'] = user.name;
        break;
      case EMAIL_TYPE.OFFER:
        this.data['username'] = user.name;
        break;
      case EMAIL_TYPE.THANKS_FOR_PURCHASE:
        this.data['username'] = user.name;
        break;
      default:
        break;
    }
    return this;
  }
  publishThankyouNotification(user, purchaseProductInfo) {
    this.template = fs
      .readFileSync(path.resolve(EMAIL_TEMPLATE.THANK_YOU), 'utf8')
      .toString();
    this.data['currentYear'] = new Date().getFullYear();
    let redirectionURL;
    let btnText;
    switch (purchaseProductInfo.type) {
      case PRODUCTS_TYPE.notes:
        redirectionURL = REDIRECTION_URL.NOTES.replace(
          '{{id}}',
          purchaseProductInfo._id
        );
        btnText = 'Go to notes';
        break;
      case PRODUCTS_TYPE.quiz:
        redirectionURL = REDIRECTION_URL.QUIZ.replace(
          '{{id}}',
          purchaseProductInfo._id
        );
        btnText = 'Go to quiz';
        break;
      case PRODUCTS_TYPE.test_series:
        redirectionURL = REDIRECTION_URL.TEST_SERIES;
        btnText = 'Go to Test Series';
        break;
      case PRODUCTS_TYPE.bulk:
        redirectionURL = REDIRECTION_URL.BULK.replace(
          '{{id}}',
          purchaseProductInfo._id
        );
        btnText = 'Go to notes';
        break;
      case PRODUCTS_TYPE.course:
        redirectionURL = REDIRECTION_URL.COURSE.replace(
          '{{id}}',
          purchaseProductInfo._id
        );
        btnText = 'Go to Course';
        break;
      default:
        break;
    }
    this.data['landingLink'] = `https://eduseeker.in${redirectionURL}`;
    this.data['btnText'] = btnText;
    this.data['username'] = user.name;
    this.data['productName'] = purchaseProductInfo.name;
    return this.sendEmail(user.email);
  }
  pulishEnrollmentExpireNotification(user, productData, expiryDate) {
    this.template = fs
      .readFileSync(path.resolve(EMAIL_TEMPLATE.ENROLLMENT_EXPIRE), 'utf8')
      .toString();
    this.data['currentYear'] = new Date().getFullYear();
    this.data['username'] = user.name;
    this.data['productName'] = productData.name;
    if (typeof expiryDate == 'object') {
      this.data['expireDate'] = moment(expiryDate).format('YYYY-MM-DD');
    }
    return this.sendEmail(user.email);
  }
  async verificationEmail(user, verificationToken) {
    this.subject = EMAIL_SUBJECTS.EMAIL_VERIFICATION;
    this.template = fs
      .readFileSync(path.resolve(EMAIL_TEMPLATE.EMAIL_VERIFICATION), 'utf8')
      .toString();
    this.data['currentYear'] = new Date().getFullYear();
    this.data['username'] = user.name;
    this.data['landingLink'] = `${
      process.env.FE_SERVER_URL
    }${REDIRECTION_URL.EMAIL_VERIFICATION.replace(
      '{{verificationToken}}',
      verificationToken
    )}`;
    return this.sendEmail(user.email);
  }
  OTPVerificationEmail(otp, type, email) {
    this.subject = EMAIL_SUBJECTS.OTP_VERIFICATION;
    this.template = fs
      .readFileSync(path.resolve(EMAIL_TEMPLATE.OTP_VERIFICATION), 'utf8')
      .toString();
    this.data['currentYear'] = new Date().getFullYear();
    this.data['otpFor'] = 'log into your account';
    this.data['otp'] = otp;
    return this.sendEmail(email);
  }
  forgotPasswordEmail(user) {
    this.subject = EMAIL_SUBJECTS.FORGOT_PASSWORD;
    this.template = fs
      .readFileSync(path.resolve(EMAIL_TEMPLATE.FORGOT_PASSWORD), 'utf8')
      .toString();
    this.data['fullName'] = user.name;
    this.data['resetPasswordLink'] = user.resetPasswordToken;
    this.data['FE_SERVER'] = process.env.FE_SERVER_URL;
    return this.sendEmail(user.email);
  }
};
