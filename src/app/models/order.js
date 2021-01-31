const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user' },
    instructor_id: {type: Schema.Types.ObjectId, ref: 'user'},
    parent_product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    product_type: { type: String, enum: ['1', '2', '3', '4'] },
    product_name: { type: String },
    product_image: [{ type: String }],
    payment_request_id: { type: String },
    final_price: { type: Number },
    order_status: { type: String, default: 'Pending' },
    validity: { type: Date },
    createdAt: {type:Date},
    updatedAt: {type:Date},
});
schema.index({user_id:1}, {unique:false});
schema.index({instructor_id:1}, {unique:false});
schema.index({product_id:1}, {unique:false});
schema.index({order_status:1}, {unique:false});
schema.set('timestamps', true);
let Order = MONGOOSE.model('order', schema);
module.exports = { Order };
