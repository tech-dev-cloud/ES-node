const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'product' },
  url: { type: String },
  filename: { type: String },
  size: { type: String },
  status: { type: Boolean, default: true },
  mime_type: { type: String },
  type: { type: String, enum: ['ppt', 'pdf', 'video'] }, //1-> default Image, 2-> Video, 3-> GIF, 4-> pdf, 5->doc
  // priority:{type:Number, default:1},
  user_id: { type: Schema.Types.ObjectId, ref: 'users' },
});

schema.set('timestamps', true);
schema.index({ product_id: 1 }, { unique: false });
schema.index({ filename: 'text' });
schema.index({ status: 1 }, { unique: false });
const Document = MONGOOSE.model('document', schema);
module.exports = { Document };
