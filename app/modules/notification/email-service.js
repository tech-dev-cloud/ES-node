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
module.exports = class Email {
  constructor(obj) {
    if (obj) {
      this.subject = obj.subject || 'Test';
      this.template = obj.template;
      this.type = obj.type;
    }
    this.data = {};
  }
  sendEmail(email) {
    const template = handleBar.compile(this.template);
    const content = template(this.data);
    const obj = {
      Destination: {
        ToAddresses: [email, 'damandeeps16@gmail.com'],
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
    console.log(obj);
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
  set _template(template) {
    this.template = template;
  }
  set _subject(subject) {
    this.subject = subject;
  }
  set _type(type) {
    this.type = type;
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
    if (['tamit9509@gmail.com'].includes(user.email)) {
      console.log(this.data, user.email);
      this.sendEmail(user.email).then((res) => {
        console.log(res);
      });
    }
    // this.sendEmail(user.email);
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
    if (['tamit9509@gmail.com'].includes(user.email)) {
      this.sendEmail(user.email).then((res) => {
        console.log(res);
      });
    }
  }
};
