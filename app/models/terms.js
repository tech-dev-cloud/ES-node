const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  term:{type:String, required:true, unique:true},
  parent_id:{type:Schema.Types.ObjectId}
});

let TermsModel = MONGOOSE.model('term', schema);
module.exports = { TermsModel };
