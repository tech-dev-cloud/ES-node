const { EMAIL_TYPES, EMAIL_TYPE } = require('../../utils/constants');

const handleBar = require('handlebars');
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
};
