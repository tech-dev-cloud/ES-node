
const {Taxonomy} = require('../../mongo-models/taxonomy');
const {ProductTaxonomy} = require('../../mongo-models/productTaxonomy');
module.exports = {
    addTaxonomy: (payload)=>{
        return Taxonomy.insert(payload);
    },
    mapTaxonomyProducts: (payload)=>{
        return ProductTaxonomy.insertMany(payload);
    },
    removeProductTaxonomy: (productId)=>{
        return ProductTaxonomy.deleteMany({productId});
    }
}