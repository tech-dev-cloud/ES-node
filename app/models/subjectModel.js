const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
});

schema.set('timestamps', true);
let SubjectModel = MONGOOSE.model('subject', schema);
module.exports = { SubjectModel };
