const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'product' },
  image_path: { type: String },
  filename: { type: String },
  size: { type: String },
  status: { type: Boolean, default: true },
  type: { type: String, enum: ['1', '2', '3'] }, //1-> default Image, 2-> Video, 3-> GIF
  priority: { type: Number, default: 1 },
});

schema.set('timestamps', true);
schema.index({ product_id: 1 }, { unique: false });
const ProductImage = MONGOOSE.model('product_image', schema);
module.exports = { ProductImage };
