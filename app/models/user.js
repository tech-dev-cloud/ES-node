const { LOGIN_TYPE } = require('../utils/constants');

class User {
  constructor(obj, user_type) {
    this.name = obj.name;
    this.email = obj.email;
    this.phoneNumber = obj.phoneNumber;
    this.registerType = obj.registerType;
    this.profile_pic = obj.profile_pic
      ? obj.profile_pic
      : obj.profile_pic;
    this.role = [2];
    if (user_type == LOGIN_TYPE.FACEBOOK) {
      this.fbDetails = obj;
    } else if (user_type == LOGIN_TYPE.GOOGLE) {
      this.googleDetails = obj;
    }
  }
}

module.exports = { User };
