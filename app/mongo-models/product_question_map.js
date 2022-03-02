const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, required: true, ref: 'product' },
  question_id: { type: Schema.Types.ObjectId, required: true, ref: 'question' },
  priority: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
});

schema.set('timestamps', true);
schema.index({ product_id: 1 }, { unique: false });
schema.index({ question_id: 1 }, { unique: false });
schema.index({ status: 1 }, { unique: false });
const ProductQuestionMap = MONGOOSE.model('product_question_map', schema);
module.exports = { ProductQuestionMap };
