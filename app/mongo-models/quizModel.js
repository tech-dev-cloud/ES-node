const { DIFFICULT_LEVEL } = require('../utils/constants');
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  title: { type: String, required: true },
  heading: { type: String },
  subjectId: [{ type: Schema.Types.ObjectId, required: true, ref: 'subjects' }],
  status: { type: Boolean, default: true },
  examType: [{ type: Schema.Types.ObjectId, ref: 'examtype' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  difficultLevel: { type: String, enum: Object.values(DIFFICULT_LEVEL) },
  questionList: [{ type: Schema.Types.ObjectId, ref: 'question' }],
  totalQuestions: { type: Number },
  attemptTime: { type: Number },
  isDeleted: { type: Boolean, default: false },
});

schema.set('timestamps', true);
schema.index({ name: 'text', heading: 'text' });
let QuizModel = MONGOOSE.model('quiz', schema);
module.exports = { QuizModel };
