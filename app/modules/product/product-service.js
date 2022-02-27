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
        url: 'https://eduseeker-image-bucket.s3.amazonaws.com/dev/1644677249747e-BOOKS_EduSeeker%20%20TABLET_small%20%281%29.jpg',
        link: params.homeBannerRedirection.ebooksBulk,
      },
      {
        url: 'https://eduseeker-image-bucket.s3.amazonaws.com/dev/1644385864038course_ir.webp',
        link: params.homeBannerRedirection.course,
      },
      {
        url: 'https://eduseeker-image-bucket.s3.amazonaws.com/dev/1644385964328testimonial_1.webp',
        link: '.',
      },
    ];
  },
};

module.exports = { ...service };
