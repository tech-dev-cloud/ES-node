const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  offer_id: { type: Schema.Types.ObjectId, ref: 'offer' },
  product_id: { type: Schema.Types.ObjectId, ref: 'product' },
  status: { type: Boolean, default: true },
});
schema.index({ offer_id: 1 }, { unique: false });
schema.index({ product_id: 1 }, { unique: false });
schema.set('timestamps', true);
const OfferProductMap = MONGOOSE.model('offer_product_map', schema);
module.exports = { OfferProductMap };
