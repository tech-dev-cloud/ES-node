const {Product} =require('../../mongo-models/product');
const {Document} =require('../../mongo-models/documents');
const {ProductQuestionMap} =require('../../mongo-models/product_question_map');

module.exports = {
    createProduct: (payload)=>{
        const product = new Product(payload);
        return product.save();
    },
    insertMultipleDocuments(payload){
        return Document.insertMany(payload);
    },
    productQuestionInsert(payload) {
        return ProductQuestionMap.insertMany(payload);
    }
}