const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
    user_id:{type:Schema.Types.ObjectId, ref:'user'},
    product_id:{type:Schema.Types.ObjectId, ref:'product'},
    product_type:{type:String, enum:['1','2','3','4']},
    product_name:{type:String},
    product_image:{type:String},
    cart_total:{type:Number},
    final_price:{type:Number},
    order_status:{type:String}
});

schema.set('timestamps', true);
let Order = MONGOOSE.model('order', schema);
module.exports = { Order };
