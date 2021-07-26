const { Schema, model, connections } = require('mongoose');

const schema = new Schema({
  term: { type: String, required: true, unique: true },
  parent_id: { type: Schema.Types.ObjectId, ref: 'terms' },
  description: { type: String },
  status: { type: Boolean },
});

const TermsModel = model('term', schema);
module.exports = { TermsModel };
