const { LOGIN_TYPE } = require("../utils/constants");

class User {
    constructor(obj, user_type, socailObj) {
        this.name = obj.name;
        this.email = obj.email;
        this.phoneNumber = obj.phoneNumber;
        this.profile_pic = obj.profile_pic;
        this.role = [2];
        if (user_type == LOGIN_TYPE.FACEBOOK) {
            this.fbDetails = socailObj;
        } else if (user_type == LOGIN_TYPE.GOOGLE) {
            this.googleDetails = socailObj;
        }
    }
}

module.exports = { User }