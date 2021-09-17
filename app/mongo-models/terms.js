const { Schema, model, connections } = require('mongoose');

const schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String },
  parent_id: { type: Schema.Types.ObjectId, ref: 'terms' },
  description: { type: String },
  status: { type: Boolean },
  icon: { type: String },
});

const TermsModel = model('term', schema);
module.exports = { TermsModel };
