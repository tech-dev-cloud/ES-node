const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
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
    type: { type: String, enum: ['notes', 'quiz', 'bulk', 'course'] }, // 1->PDF/notes/e-books, 2->quiz, 3->Bulk Pack, 4-> course
    priority: { type: Number, default: 0 },
    similar_products: [{ type: Schema.Types.ObjectId }],
    isDraft: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    validity: { type: Number },
    isPublish: { type: Boolean, default: false },
    product_meta: {},
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },
    sub_products: [{ type: Schema.Types.ObjectId, ref: 'products' }]
});

schema.set('timestamps', true);
schema.index({ name: "text", heading: "text" });
schema.index({ status: 1 }, { unique: false });
schema.index({ type: 1 }, { unique: false });
schema.index({ created_by: 1 }, { unique: false });
let Product = MONGOOSE.model('product', schema);
module.exports = { Product };
