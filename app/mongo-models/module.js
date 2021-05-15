const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref:'subjects', required:true },
  name:{type:String, required:true},
  status:{type:Boolean, default:true},
  priority:{type:Number, max:15, min:1, default:1}
})

schema.set('timestamps', true);
schema.index({subjectId:1},{unique:false});
let Module = MONGOOSE.model('module', schema);
module.exports = { Module };
