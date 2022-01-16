const { Schema, model } = require('mongoose');
const { EMAIL_TYPE, USER_GROUP } = require('../utils/constants');

const schema = new Schema({
  title: { type: String },
  subject: { type: String, required: true },
  type: { type: String, enum: Object.values(EMAIL_TYPE) },
  userGroup: {
    type: String,
    enum: Object.values(USER_GROUP),
    default: USER_GROUP.subscribers,
  },
  template: {
    type: String,
    required: true,
  },
  status: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
});

schema.set('timestamps', true);
const Template = model('template', schema);
module.exports = { Template };
