const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  price:{type:Number},
  grand_total:{type:Number},
  parent_id:{type: Schema.Types.ObjectId},
  productId: { type: Schema.Types.ObjectId, required: true, ref: 'quiz' },
  productType: { type: String, default:'quiz' },
  payment_request_id: { type: String },
  status: { type: String, default: 'Pending' },
  payment_id: { type: String },
  created_by:{ type: Schema.Types.ObjectId, ref: 'users' }
})

schema.set('timestamps', true);
schema.index({userId:1},{unique:false});
schema.index({productId:1},{unique:false});
schema.index({status:1},{unique:false});
const PaymentModel = MONGOOSE.model('payment', schema);
module.exports = { PaymentModel };