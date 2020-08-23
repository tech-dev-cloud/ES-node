const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'subjects', required: true },
  // topicId: { type: Schema.Types.ObjectId, ref: 'topics', required: true },
  question: { type: String, required: true, unique: true },
  description: { type: String },
  options: [{ type: String, required: true }],
  correctOption: [{ type: Number, required: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  status: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
});

schema.set('timestamps', true);
let QuestionModel = MONGOOSE.model('question', schema);
module.exports = { QuestionModel };
