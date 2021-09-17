const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'products' },
  termId: { type: Schema.Types.ObjectId, ref: 'taxonomy' },
  status: { type: Boolean, default:true },
});

const ProductTaxonomy = model('product_taxonomy', schema);
module.exports = { ProductTaxonomy };
