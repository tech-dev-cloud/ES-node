const dbQuery =require('./dbQuery/taxonomy');

module.exports = {
    createNewTaxonomy: (payload)=>{
        return dbQuery.addTaxonomy(payload);
    },
    replaceProductTaxonomy: async (productId, term_ids =[]) =>{
        term_ids = term_ids.map(termId=>({productId, termId}));
        await dbQuery.removeProductTaxonomy(productId)
        return dbQuery.mapTaxonomyProducts(term_ids);
    }
}