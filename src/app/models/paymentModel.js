const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  productId: { type: Schema.Types.ObjectId, required: true, ref: 'quiz' },
  productType: { type: String },
  payment_request_id: { type: String },
  status: { type: String, default: 'Pending' },
  payment_id: { type: String },
  created_at: { type: Date },
  modified_at: { type: Date }
})

// schema.set('timestamps', true);
const PaymentModel = MONGOOSE.model('payment', schema);
module.exports = { PaymentModel };