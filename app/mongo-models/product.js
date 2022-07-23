const MONGOOSE = require('mongoose');
const { PRODUCTS_TYPE } = require('../utils/constants');
const Schema = MONGOOSE.Schema;

const productSchema = new Schema({
  name: { type: String },
  heading: { type: String },
  strikeprice: { type: Number },
  price: { type: Number },
  isPaid: { type: Boolean, default: false },
  description: { type: String },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  targetStudents: [{ type: String }],
  learning: [{ type: String }],
  cover_image: { type: String },
  promo_video_url: { type: String },
  early_birds_offer: [
    {
      price: { type: Number },
      enrolled_limit: { type: Number },
    },
  ],
  type: {
    type: String,
    enum: Object.values(PRODUCTS_TYPE),
  },
  priority: { type: Number, default: 0 },
  similar_products: [{ type: Schema.Types.ObjectId }],
  isDraft: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  validity: { type: Number },
  isPublish: { type: Boolean, default: false },
  product_meta: {},
  created_by: { type: Schema.Types.ObjectId, ref: 'user' },
  sub_products: [{ type: Schema.Types.ObjectId, ref: 'products' }],
  quizId: [{ type: Schema.Types.ObjectId, ref: 'quiz' }],
  docs: [{ type: Schema.Types.ObjectId, ref: 'document' }],
});

productSchema.set('timestamps', true);
productSchema.index({ name: 'text', heading: 'text' });
productSchema.index({ status: 1 }, { unique: false });
productSchema.index({ type: 1 }, { unique: false });
productSchema.index({ created_by: 1 }, { unique: false });
const Product = MONGOOSE.model('product', productSchema);
module.exports = { Product };
