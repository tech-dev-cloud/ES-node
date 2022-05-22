const MONGOOSE = require('mongoose');
const CONSTANTS = require('../utils/constants');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  userId: { type: Schema.Types.ObjectId },
  objectModel:{type:String, enum:['quiz'], default:'quiz'},
  objectId:{type: Schema.Types.ObjectId, ref:'quiz'},
  fileName:{type:String},
  mimeType:{type:String},
  size:{type:Number}
})

schema.set('timestamps', true);
let File = MONGOOSE.model('file', schema);
module.exports = { File };
