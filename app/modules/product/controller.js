const { getSearchProd } = require('./service');
async function searchProducts(request, response) {
  const searchString = request.query.searchString;
  const data = await getSearchProd(searchString);
  response.status(200).json({
    success: true,
    data,
  });
}
module.exports = { searchProducts };
