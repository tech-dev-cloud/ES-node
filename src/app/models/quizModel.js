const { DIFFICULT_LEVEL, PRODUCT_TYPE } = require('../utils/constants');
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, required: true, ref: 'subjects' },
  status: { type: Boolean, default: false },
  examType: [{ type: Schema.Types.ObjectId, ref: 'examtype' }],

  imageURL: { type: String, required: true },
  isPaid: { type: Boolean, required: true },
  amount: { type: Number },
  instructor: { type: Schema.Types.ObjectId, ref: 'user' },
  headline: { type: String },
  // numSubscribers: { type: Number },
  // avgRating: { type: Number },
  // numReviews: { type: Number },
  difficultLevel: { type: String, enum: Object.values(DIFFICULT_LEVEL) },
  // objectivesSummary: [{ type: String }],
  // requirements: [{ type: String }],
  description: { type: String },
  productType: { type: String, enum: Object.values(PRODUCT_TYPE), default: PRODUCT_TYPE.QUIZ },

  questionList: [{ type: Schema.Types.ObjectId, ref: 'question' }],
  // numQuestions: { type: Number },
  attemptTime: { type: Number },
  isDeleted: { type: Boolean, default: false }
});

schema.set('timestamps', true);
let QuizModel = MONGOOSE.model('quiz', schema);
module.exports = { QuizModel };
