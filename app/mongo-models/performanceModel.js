const MONGOOSE = require('mongoose');
const { DB } = require('../utils/constants');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'products' },
  user_id: { type: Schema.Types.ObjectId, ref: 'user' },
  type: { type: String, enum: ['product', 'quiz'] },
  remainingTime: {
    hours: { type: Number },
    minutes: { type: Number },
    seconds: { type: Number },
  },
  status: {
    type: String,
    enum: Object.values(DB.QUIZ_PLAY_STATUS),
    default: DB.QUIZ_PLAY_STATUS.IN_PROGRESS,
  },
  userAnswers: [
    {
      question_id: { type: Schema.Types.ObjectId, ref: 'question' },
      answer: [{ type: String }],
      status: { type: Number, enum: Object.values(DB.ANSWER_ACTION) },
      resultStatus: { type: String, enum: Object.values(DB.ANSWER_RESULT) },
    },
  ],
  correct: { type: Number },
  incorrect: { type: Number },
  notAnswered: { type: Number },
  totalScore: { type: Number },
  finalScore: { type: Number },
});
schema.set('timestamps', true);
const PerformanceModel = MONGOOSE.model('performance', schema);
module.exports = { PerformanceModel };
