const {
  saveOfferedProducts,
  removeOfferedProducts,
  addOffer,
  updateOffer,
  productOffers,
} = require('./entity');

module.exports = {
  createNewOffer(offerData) {
    return addOffer(offerData);
  },
  mapOfferProducts: (offer_id, productIds = [], removeProductIds = []) => {
    const dataToSave = productIds.map((product_id) => ({
      offer_id,
      product_id,
    }));
    if (removeProductIds.length) {
      removeOfferedProducts({
        offer_id,
        product_id: { $in: removeProductIds },
      });
    }
    return saveOfferedProducts(dataToSave);
  },
  updateOfferData: (offerId, dataToUpdate) => {
    updateOffer(offerId, dataToUpdate);
  },
  getProductOffers: async (productId) => {
    return productOffers(productId);
  },
};
