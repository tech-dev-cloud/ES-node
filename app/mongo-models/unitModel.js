const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, required: true },
  number: { type: Number, required: true },
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
});

schema.set('timestamps', true);
let UnitModel = MONGOOSE.model('unit', schema);
module.exports = { UnitModel };
