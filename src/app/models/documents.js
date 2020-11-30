const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    product_id:{type:Schema.Types.ObjectId, required:true, ref:'product'},
    url:{type:String,},
    priority:{type:Number, default:0},
    product_type:{type:String,enum:['1','2','3','4'], required:true}, //"1->PDF, 2->quiz, 3->books, 4-> course"
    status:{type:Number, default:1},
    mime_type:{type:String}
});

schema.set('timestamps', true);
let Document = MONGOOSE.model('document', schema);
module.exports = { Document };
