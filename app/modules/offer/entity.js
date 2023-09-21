const { Offer } = require('../../mongo-models/offers');
const { OfferProductMap } = require('../../mongo-models/offer_product_map');

module.exports = {
  addOffer: (data) => {
    const offer = new Offer(data);
    return offer.save();
  },
  saveOfferedProducts: (dataToSave) => {
    return OfferProductMap.insertMany(dataToSave);
  },
  removeOfferedProducts: (conditions) => {
    return OfferProductMap.deleteMany(conditions);
  },
  updateOffer: (offerId, dataToUpdate) => {
    return Offer.findOneAndUpdate({ _id: offerId }, dataToUpdate);
  },
  productOffers(product_id) {
    return OfferProductMap.find(
      { product_id, status: true },
      { offer_id: 1 }
    ).populate('offer_id');
  },
};
