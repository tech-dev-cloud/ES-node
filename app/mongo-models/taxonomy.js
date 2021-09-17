const { Schema, model } = require('mongoose');

const schema = new Schema({
  name: { type: String, required: true, unique: true },
  parent_id: { type: Schema.Types.ObjectId, ref: 'terms' },
  description: { type: String },
  status: { type: Boolean },
  icon: { type: String }
});

const Taxonomy = model('taxonomy', schema);
module.exports = { Taxonomy };
