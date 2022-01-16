const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, require: true, unique: true },
  status: { type: Boolean, default: false },
});

schema.set('timestamps', true);
const Subscriber = MONGOOSE.model('subscriber', schema);
module.exports = { Subscriber };
