const { searchProducts } = require('./product-entity');
const { config } = require('../../../config/config');
const params = require(`../../../config/env/${config.NODE_ENV}_params.json`);

const service = {
  getSearchProd: async (searchString) => {
    return searchProducts(searchString);
  },
  getHomeBanners: () => {
    return [
      {
        url: 'https://eduseeker-image-bucket.s3.amazonaws.com/s1/1654263059525e-books.webp',
        link: params.homeBannerRedirection.ebooksBulk,
      },
      {
        url: 'https://eduseeker-image-bucket.s3.ap-south-1.amazonaws.com/s1/1654263447386IR_EduSeeker%20-%20LAPTOP%20SCREEN-min.webp',
        link: params.homeBannerRedirection.course,
      },
      {
        url: 'https://eduseeker-image-bucket.s3.ap-south-1.amazonaws.com/s1/1654263415156testimonials%20eduseeker%20-%203-min.webp',
        link: '.',
      },
    ];
  },
};

module.exports = { ...service };
