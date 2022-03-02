const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  moduleId: { type: Schema.Types.ObjectId, ref: 'modules', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'subjects' },
  name: { type: String, required: true },
  status: { type: Boolean, default: true },
});

schema.set('timestamps', true);
schema.index({ moduleId: 1 }, { unique: false });
const Topics = MONGOOSE.model('topic', schema);
module.exports = { Topics };
