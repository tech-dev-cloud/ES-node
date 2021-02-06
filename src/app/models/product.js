const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    name:{type:String, required:true},
    heading:{type:String},
    strikeprice:{type:Number},
    price:{type:Number},
    isPaid:{type:Boolean, default:false},
    description:{type:String},
    type:{type:String, enum:['1','2','3','4']}, // 1->PDF/notes/e-books, 2->quiz, 3->Bulk Pack, 4-> course
    priority:{type:Number, default:0},
    similar_products:[{type:Schema.Types.ObjectId}],
    status:{type:Boolean, default:true},
    validity:{type:Number},
    product_meta:{},
    created_by:{type:Schema.Types.ObjectId, ref:'user'},
    benefits:[{type:String}],
    sub_products:[{type:Schema.Types.ObjectId, ref:'products'}]
});

schema.set('timestamps', true);
schema.index({name:"text", heading:"text"});
schema.index({status:1},{unique:false});
schema.index({type:1},{unique:false});
let Product = MONGOOSE.model('product', schema);
module.exports = { Product };
