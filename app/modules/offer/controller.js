const { ERROR_TYPE } = require('../../utils/constants');
const messages = require('../../utils/messages');
const responseHelper = require('../../utils/responseHelper');
const {
  createNewOffer,
  mapOfferProducts,
  updateOfferData,
} = require('./service');
const offerService = require('./service');
module.exports = {
  addNewOffer: async (request, response) => {
    const payload = request.body;
    createNewOffer(payload).then(async (res) => {
      try {
        await mapOfferProducts(res._id, request.body.productIds);
        response
          .status(200)
          .json(responseHelper.createSuccessResponse(messages.SUCCESS));
      } catch (err) {
        response
          .status(500)
          .json(
            responseHelper.createErrorResponse(
              ERROR_TYPE.INTERNAL_SERVER_ERROR,
              messages.SOMETHING_WENT_WRONG
            )
          );
      }
    });
  },
  updateOffer: async (request, response) => {
    const offerId = request.params.offerId;
    Promise.all([
      mapOfferProducts(
        offerId,
        request.body.productIds,
        request.body.removeProductIds
      ),
      updateOfferData(offerId, request.body),
    ])
      .then((res) => {
        response
          .status(200)
          .json(responseHelper.createSuccessResponse(messages.SUCCESS));
      })
      .catch((err) => {
        response
          .status(500)
          .json(
            responseHelper.createErrorResponse(
              ERROR_TYPE.INTERNAL_SERVER_ERROR,
              messages.SOMETHING_WENT_WRONG
            )
          );
      });
  },
};
