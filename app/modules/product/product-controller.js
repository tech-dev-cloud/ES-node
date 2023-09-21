const { getSearchProd, getHomeBanners } = require('./product-service');
const controller = {
  searchProducts: async (request, response) => {
    const searchString = request.query.searchString;
    const data = await getSearchProd(searchString);
    response.status(200).json({
      success: true,
      data,
    });
  },
  getBanners: async (request, response) => {
    const banners = getHomeBanners();
    response.status(200).json({
      success: true,
      data: banners,
    });
  },
};

module.exports = { ...controller };
