const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    product_id:{type:Schema.Types.ObjectId, required:true},
    question_id:{type:Schema.Types.ObjectId, required:true},
    priority:{type:Number, default:0},
    status:{type:Boolean, default:true}
});

schema.set('timestamps', true);
schema.index({product_id:1},{unique:false});
schema.index({question_id:1},{unique:false});
schema.index({status:1},{unique:false});
let ProductQuestionMap = MONGOOSE.model('product_question_map', schema);
module.exports = { ProductQuestionMap };
