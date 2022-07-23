const MONGOOSE = require('mongoose');
const { PRODUCTS_TYPE } = require('../utils/constants');
const Schema = MONGOOSE.Schema;

const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'user' },
  instructor_id: { type: Schema.Types.ObjectId, ref: 'user' },
  parent_product_id: { type: Schema.Types.ObjectId, ref: 'product' },
  product_id: { type: Schema.Types.ObjectId, ref: 'product' },
  product_type: { type: String, enum: Object.values(PRODUCTS_TYPE) }, // 1->PDF/notes/e-books, 2->quiz, 3->Bulk Pack, 4-> course
  product_name: { type: String },
  product_image: [{ type: String }],
  payment_request_id: { type: String },
  final_price: { type: Number },
  order_status: { type: String, default: 'Pending' }, //Credit, Pending, Failed, Free
  validity: { type: Date },
  expire: { type: Boolean, default: false },
});
orderSchema.index({ user_id: 1 }, { unique: false });
orderSchema.index({ instructor_id: 1 }, { unique: false });
orderSchema.index({ product_id: 1 }, { unique: false });
orderSchema.index({ product_type: 1 }, { unique: false });
orderSchema.index({ order_status: 1 }, { unique: false });
orderSchema.index({ payment_request_id: 1 }, { unique: false });
orderSchema.set('timestamps', true);
orderSchema.statics.isOrders = async (product_id, user_id)=>{
  console.log(product_id, user_id)
  return Order.findOne({ 
    product_id,
    user_id: user_id,
    order_status: { $in: ['Credit', 'Free'] }
  }).lean()
}
const Order = MONGOOSE.model('order', orderSchema);
module.exports = { Order };
