const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  attemptId: { type: Schema.Types.ObjectId, ref: 'performance' },
  userId: { type: Schema.Types.ObjectId, ref: 'useruser' },
  correct: { type: Number },
  incorrect: { type: Number },
  notAnswered: { type: Number },
  score: { type: Number },
  totalScore: { Number },
});
schema.set('timestamps', true);
const QuizResult = MONGOOSE.model('result', schema);
module.exports = { QuizResult };
