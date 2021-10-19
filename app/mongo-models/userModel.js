const MONGOOSE = require('mongoose');
const { USER_ROLE } = require('../utils/constants');
const schema = MONGOOSE.Schema;

const user = new schema({
  name: { type: String, require: true, trim: true },
  email: { type: String, require: true, unique: true, trim: true },
  phoneNumber: { type: String },
  role: [{ type: Number, enum: Object.values(USER_ROLE) }],
  password: { type: String, require: true },
  resetPasswordToken: { type: String },
  profile_pic: { type: String },
  createdAt: { type: Date, default: Date.now() },
  emailVerified: { type: Boolean, default: false },
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
});

user.set('timestamps', true);
const UserModel = MONGOOSE.model('user', user);
module.exports = { UserModel };
