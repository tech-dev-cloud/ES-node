const MONGOOSE = require('mongoose');
const {DB}=require('../utils/constants');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'subjects', required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: 'modules'},
  type:{type: Number, enum:Object.values(DB.QUESTION_TYPE)},
  image:{type:String},
  question: { type: String },
  description: { type: String },
  options: [{ type: String }],
  correctOption: [{ type: Number, required: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  status: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
});

schema.set('timestamps', true);
let QuestionModel = MONGOOSE.model('question', schema);
module.exports = { QuestionModel };
