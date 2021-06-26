const { PRODUCTS_TYPE, DIFFICULT_LEVEL } = require('../utils/constants');
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, required: true, ref: 'subjects' },
  status: { type: Boolean, default: true },
  examType: [{ type: Schema.Types.ObjectId, ref: 'examtype' }],

  imageURL: { type: String },
  isPaid: { type: Boolean, required: true },
  amount: { type: Number },
  instructor: { type: Schema.Types.ObjectId, ref: 'user' },
  headline: { type: String },
  difficultLevel: { type: String, enum: Object.values(DIFFICULT_LEVEL) },
  benefits: [{ type: String }],
  // requirements: { type: String },
  // description: { type: String },
  productType: { type: String, enum: Object.values(PRODUCTS_TYPE), default: PRODUCTS_TYPE.QUIZ },
  questionList: [{ type: Schema.Types.ObjectId, ref: 'question' }],
  totalQuestions: { type: Number },
  attemptTime: { type: Number },
  isDeleted: { type: Boolean, default: false }
});

schema.set('timestamps', true);
let QuizModel = MONGOOSE.model('quiz', schema);
module.exports = { QuizModel };
