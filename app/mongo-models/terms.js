const { Schema, model } = require('mongoose');

let schema = new Schema({
  term: { type: String, required: true, unique: true },
  parent_id: { type: Schema.Types.ObjectId },
  description: { type: String },
  status: { type: Boolean }
});

let TermsModel = model('term', schema);
module.exports = { TermsModel };
