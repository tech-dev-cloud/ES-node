const { searchProducts } = require('./product-entity');
const config = require('../../../config/config');
const params = require(`../../../config/env/${config.NODE_ENV}_params.json`);

const service = {
  getSearchProd: async (searchString) => {
    return searchProducts(searchString);
  },
  getHomeBanners: () => {
    return [
      {
        url: 'https://eduseeker-image-bucket.s3.amazonaws.com/dev/1646196895504e-BOOKS_EduSeeker%20%20TABLET.png',
        link: params.homeBannerRedirection.ebooksBulk,
      },
      {
        url: 'https://eduseeker-image-bucket.s3.ap-south-1.amazonaws.com/dev/1646197006090IR_EduSeeker%20-%20LAPTOP%20SCREEN.png',
        link: params.homeBannerRedirection.course,
      },
      {
        url: 'https://eduseeker-image-bucket.s3.ap-south-1.amazonaws.com/dev/1646197129807testimonials%20eduseeker%20-%203.png',
        link: '.',
      },
    ];
  },
};

module.exports = { ...service };
