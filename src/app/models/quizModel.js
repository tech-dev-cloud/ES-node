const { DIFFICULT_LEVEL, PRODUCT_TYPE } = require('../utils/constants');
const MONGOOSE = require('mongoose');
const { title } = require('../../config/swagger');
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
  exam: { type: String },
  validity: { type: Number },
  // requirements: { type: String },
  // description: { type: String },
  productType: { type: String, enum: Object.values(PRODUCT_TYPE), default: PRODUCT_TYPE.QUIZ },
  questionList: [{ type: Schema.Types.ObjectId, ref: 'question' }],
  totalQuestions: { type:Number },
  attemptTime: { type: Number },
  isDeleted: { type: Boolean, default: false }
});
schema.index({title:'text'},{unique:false});
schema.set('timestamps', true);
let QuizModel = MONGOOSE.model('quiz', schema);
module.exports = { QuizModel };
