const { Product } = require('../../mongo-models/product');

async function searchProducts(searchString) {
  const data = await Product.find(
    { $text: { $search: searchString } },
    { _id: 1, name: 1, cover_image: 1 }
  ).lean();
  return data;
}
module.exports = { searchProducts };
