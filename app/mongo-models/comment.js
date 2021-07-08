const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    message: { type: String },
    type: { type: String, enum: ['product_review', 'lecture_query', 'feedback'] },
    object_id: { type: Schema.Types.ObjectId, required: true },
    approved_type: { type: String, enum: ['main', 'detail', 'pending'], default: 'pending' },
    rating: { type: Number },
    priority: { type: Number },
    status: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },
    is_edited: { type: Boolean, default: false },
    parent_id: { type: Schema.Types.ObjectId }
});
schema.index({ object_id: 1 }, { unique: false });
schema.index({ type: 1 }, { unique: false });
schema.set('timestamps', true);
let Comment = MONGOOSE.model('comment', schema);
module.exports = { Comment };