const MONGOOSE = require('mongoose');
const { NOT_ENROLLED } = require('../utils/errorCodes');
const { Notification } = require('./notification');
const { Order } = require('./order');
const Schema = MONGOOSE.Schema;

const commentSchema = new Schema({
  message: { type: String },
  type: { type: String, enum: ['product_review', 'lecture_query', 'feedback'] },
  object_id: { type: Schema.Types.ObjectId, required: true },
  approved_type: { type: Number, enum: [1, 2, 3], default: 3 }, // 1=> Top, 2=>medium, 3=> Low
  rating: { type: Number },
  priority: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'user' },
  is_edited: { type: Boolean, default: false },
  parent_id: { type: Schema.Types.ObjectId },
}, {timestamps: true});

commentSchema.index({ object_id: 1 }, { unique: false });
commentSchema.index({ parent_id: 1 }, { unique: false });
commentSchema.index({ type: 1 }, { unique: false });
commentSchema.index({ approved_type: 1 }, { unique: false });
commentSchema.set('timestamps', true);

commentSchema.statics.insertComment = async(object_id, type, created_by, message, parent_id, rating )=>{
  const data ={
    object_id, type, created_by, message, parent_id, rating
  }
  if(type==='product_review'){
    await Comment.deleteOne({object_id, created_by});
  }
  return Comment.create(data);
  
}

commentSchema.statics.findRepliedUsers = async (parent_id, excludeUser)=>{
  return Comment.find({$or:[{_id:parent_id}, {parent_id}], created_by:{$ne: excludeUser}}, {created_by:1}).lean();
}



const Comment = MONGOOSE.model('comment', commentSchema);

module.exports = { Comment };
