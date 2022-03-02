const MONGOOSE = require('mongoose');
const { DB, PRODUCTS_TYPE } = require('../utils/constants');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  name: { type: String, require: true },
  description: { type: String },
  category_id: { type: Schema.Types.ObjectId, required: true, ref: 'taxonomy' },
  type: { type: String, enum: Object.values(DB.OFFER_TYPES) },
  value: { type: Number },
  value_json: {
    percentage: { type: Number },
    action: { type: String, enum: Object.values(DB.PRODUCT_PRICE_TYPE) },
  },
  max_discount_price: { type: Number },
  validity_type: { type: String, enum: Object.values(DB.OFFER_VALIDITY) },
  validity: { type: String },
  status: { type: Boolean, default: true },
  product_category: { type: String, enum: Object.values(PRODUCTS_TYPE) },
});

schema.set('timestamps', true);
const Offer = MONGOOSE.model('offer', schema);
module.exports = { Offer };
