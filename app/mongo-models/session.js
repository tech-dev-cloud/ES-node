const MONGOOSE = require('mongoose');
const { USER_ROLE, LOGIN_TYPE } = require('../utils/constants');

const Schema = MONGOOSE.Schema;

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  loginType: { type: String, enum: Object.values(LOGIN_TYPE) },
  accessToken: { type: String, required: true },
  deviceToken: { type: String },
  role: [{ type: Number, enum: Object.values(USER_ROLE) }],
  loginLimitExceed:{type:Boolean}
})

schema.set("timestamps", true);
schema.index({ accessToken: 1 }, { unique: false });
let SessionModel = MONGOOSE.model('session', schema);
module.exports = { SessionModel }