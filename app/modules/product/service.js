const { searchProducts } = require('./entity');

async function getSearchProd(searchString) {
  return searchProducts(searchString);
}

module.exports = { getSearchProd };
