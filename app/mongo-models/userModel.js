const MONGOOSE = require('mongoose');
const { registerType } = require('../modules/users/user-constant');
const { USER_ROLE, REGISTER_TYPE } = require('../utils/constants');
const { GENDER } = require('../utils/server-constant');
const schema = MONGOOSE.Schema;

const userSchema = new schema({
  name: { type: String, require: true, trim: true },
  email: { type: String, require: true, unique: true, trim: true },
  phoneNumber: { type: String },
  role: [{ type: Number, enum: Object.values(USER_ROLE) }],
  password: { type: String, require: true },
  resetPasswordToken: { type: String },
  profile_pic: { type: String },
  gender: { type: String, enum: Object.values(GENDER) },
  registerType: { type: String, enum: Object.values(registerType) },
  mobileVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  address: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
  },
  googleDetails: {
    name: { type: String, trim: true },
    phoneNumber: { type: String },
    profile_pic: { type: String },
    id: { type: String },
  },
  fbDetails: {
    name: { type: String, trim: true },
    phoneNumber: { type: String },
    profile_pic: { type: String },
    id: { type: String },
  },
}, {timestamps:true});

const UserModel = MONGOOSE.model('user', userSchema);
module.exports = { UserModel };
