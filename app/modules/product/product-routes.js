const { getBanners } = require('./product-controller');

module.exports = [
  {
    path: '/api/home-banners',
    method: 'GET',
    joiSchemaForSwagger: {
      group: 'Product',
      description: 'Api to get home banners',
      model: 'GetHomeBanners',
    },
    handler: getBanners,
  },
];
