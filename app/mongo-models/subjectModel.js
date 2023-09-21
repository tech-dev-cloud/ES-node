const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  name: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  // exams: [{ type: Schema.Types.ObjectId, ref: 'terms' }],
});

schema.set('timestamps', true);
const SubjectModel = MONGOOSE.model('subject', schema);
module.exports = { SubjectModel };
