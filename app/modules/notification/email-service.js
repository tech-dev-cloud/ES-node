const fs = require('fs');
const handleBar = require('handlebars');
const path = require('path');
const { EMAIL_TYPE, EMAIL_TEMPLATE } = require('../../utils/constants');
const { aws } = require('../../services/aws');
module.exports = class Email {
  constructor(obj) {
    this.Subject = obj.subject || 'Test';
    this.template = obj.template;
    this.type = obj.type;
    this.data = {};
  }
  sendEmail(email) {
    const template = handleBar.compile(this.template);
    const content = template(this.data);
    const obj = {
      Destination: {
        ToAddresses: [email],
      },
      Source: 'theeduseeker@gmail.com',
      Message: {
        Body: {
          Html: { Data: content },
        },
        Subject: {
          Data: this.Subject,
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
  set _template(template) {
    this.template = template;
  }
  set _subject(subject) {
    this.Subject = subject;
  }
  set _type(type) {
    this.type = type;
  }
  publishThankyouNotification(user) {
    this.Subject = 'Thanks for enrollment';
    this.template = fs
      .readFileSync(path.resolve(EMAIL_TEMPLATE.THANK_YOU), 'utf8')
      .toString();
    this.data['year'] = new Date().getFullYear();
    this.data['username'] = user.name;
    this.sendEmail(user.email);
  }
};
