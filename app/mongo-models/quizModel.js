const { DIFFICULT_LEVEL } = require('../utils/constants');
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  heading: { type: String },
  subjectId: { type: Schema.Types.ObjectId, required: true, ref: 'subjects' },
  moduleId: [{ type: Schema.Types.ObjectId, ref: 'modules' }],
  status: { type: Boolean, default: true },
  type: { type: String, enum: ['module', 'mixed'] },
  exam: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  difficultLevel: { type: String, enum: Object.values(DIFFICULT_LEVEL) },
  questionList: [{ type: Schema.Types.ObjectId, ref: 'question' }],
  totalQuestions: { type: Number },
  attemptTime: { type: Number },
  isDeleted: { type: Boolean, default: false },
});

schema.set('timestamps', true);
schema.index({ name: 'text', heading: 'text' });
const QuizModel = MONGOOSE.model('quiz', schema);
module.exports = { QuizModel };
