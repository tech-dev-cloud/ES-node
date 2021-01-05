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
  createdAt: { type: Date, default: Date.now() }
})
user.index({email:1},{unique:true});
user.set("timestamps", true);
let UserModel = MONGOOSE.model('user', user);
module.exports = { UserModel }