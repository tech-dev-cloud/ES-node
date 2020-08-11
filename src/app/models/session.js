const MONGOOSE = require('mongoose');
const { USER_ROLE } = require('../utils/constants');

const Schema = MONGOOSE.Schema;

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  accessToken: { type: String, required: true },
  deviceToken: { type: String },
  role: { type: Number, enum: Object.values(USER_ROLE) }
})

schema.set("timestamps", true);
let SessionModel = MONGOOSE.model('session', schema);
module.exports = { SessionModel }