const { Schema, model } = require('mongoose');

const schema = new Schema({
  name: { type: String, required: true, unique: true },
  parent_id: { type: Schema.Types.ObjectId, ref: 'taxonomy' },
  description: { type: String },
  status: { type: Boolean },
  icon: { type: String },
  banner_image: { type: String },
});

schema.set('timestamps', true);
const Taxonomy = model('taxonomy', schema);
module.exports = { Taxonomy };
