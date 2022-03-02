const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const schema = new Schema({
  offer_id: { type: Schema.Types.ObjectId, ref: 'offer' },
  user_id: { type: Schema.Types.ObjectId, ref: 'user' },
  web_user_id: { type: String },
  status: { type: Boolean },
  start_date: { type: Date },
  end_date: { type: Date },
});

schema.set('timestamps', true);
const OfferUserMap = MONGOOSE.model('offer_user_map', schema);
module.exports = { OfferUserMap };
