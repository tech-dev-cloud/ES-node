const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    product_id:{type:Schema.Types.ObjectId, ref:'product'},
    url:{type:String},
    filename:{type:String},
    size:{type:String},
    status:{type:Boolean, default:true},
    mime_type:{type:String},
    type:{type:String,enum:['1','2', '3', '4', '5'] }, //1-> default Image, 2-> Video, 3-> GIF, 4-> pdf, 5->doc
    priority:{type:Number, default:1}
});

schema.set('timestamps', true);
let Document = MONGOOSE.model('document', schema);
module.exports = { Document };
