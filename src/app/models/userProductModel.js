const MONGOOSE = require('mongoose');
const schema = MONGOOSE.Schema;

const userProduct = new schema({
  userId: { type: schema.Types.ObjectId, ref: 'users' },
  productId: { type: schema.Types.ObjectId, ref: 'quiz' }
})
userProduct.set('timestamps', true);
const UserProductModel = MONGOOSE.model('userproduct', userProduct);
module.exports = { UserProductModel }