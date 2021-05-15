const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    product_id: { type: Schema.Types.ObjectId, required: true, ref: 'product' },
    title: { type: String, required: true },
    priority: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    lectures: [{
        title: { type: String },
        description: { type: String },
        isPreview: { type: Boolean, default: false },
        url: { type: String },
        file_type: { type: String, enum: ['video', 'pdf'] },
        volume: { type: Number },
        duration: { type: Number }
    }]
});

schema.set('timestamps', true);
schema.index({ product_id: 1 }, { unique: false });
schema.index({ created_by: 1 }, { unique: false });
schema.index({ status: 1 }, { unique: false });
let VideoContentModel = MONGOOSE.model('videoContent', schema);
module.exports = { VideoContentModel };
