const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user' },
    instructor_id: { type: Schema.Types.ObjectId, ref: 'user' },
    parent_product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    product_id: { type: Schema.Types.ObjectId, ref: 'product' },
    product_type: { type: String, enum: ['notes', 'quiz', 'bulk', 'course'] }, // 1->PDF/notes/e-books, 2->quiz, 3->Bulk Pack, 4-> course
    product_name: { type: String },
    product_image: [{ type: String }],
    payment_request_id: { type: String },
    final_price: { type: Number },
    order_status: { type: String, default: 'Pending' }, //Credit, Pending, Failed
    validity: { type: Date }
});
schema.index({ user_id: 1 }, { unique: false });
schema.index({ instructor_id: 1 }, { unique: false });
schema.index({ product_id: 1 }, { unique: false });
schema.index({ product_type: 1 }, { unique: false });
schema.index({ order_status: 1 }, { unique: false });
schema.index({ payment_request_id: 1 }, { unique: false });
schema.set('timestamps', true);
let Order = MONGOOSE.model('order', schema);
module.exports = { Order };
