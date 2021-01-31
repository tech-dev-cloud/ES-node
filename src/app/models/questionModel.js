const MONGOOSE = require('mongoose');
const {DB}=require('../utils/constants');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  _id: {type: Schema.Types.ObjectId},
  subjectId: { type: Schema.Types.ObjectId, ref: 'subjects', required: true },
  moduleId: { type: Schema.Types.ObjectId, ref: 'modules'},
  type:{type: Number, enum:Object.values(DB.QUESTION_TYPE)},
  image:{type:String},
  question: { type: String },
  description: { type: String },
  options: [{ type: String }],
  correctOption: [{ type: Number, required: true }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: {type:Date},
  updatedAt: {type:Date}
});

// schema.set('timestamps', true);
let QuestionModel = MONGOOSE.model('question', schema);
module.exports = { QuestionModel };
