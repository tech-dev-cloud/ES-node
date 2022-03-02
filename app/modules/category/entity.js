const { Taxonomy } = require('../../mongo-models/taxonomy');
const { ProductTaxonomy } = require('../../mongo-models/productTaxonomy');
module.exports = {
  addTaxonomy: (payload) => {
    const obj = new Taxonomy(payload);
    return obj.save();
  },
  mapTaxonomyProducts: (payload) => {
    return ProductTaxonomy.insertMany(payload);
  },
  removeProductTaxonomy: (productId) => {
    return ProductTaxonomy.deleteMany({ productId });
  },
};
