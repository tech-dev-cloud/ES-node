const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
});
schema.set('timestamps', true);
const ExamModel = MONGOOSE.model('exam', schema);
module.exports = { ExamModel };
