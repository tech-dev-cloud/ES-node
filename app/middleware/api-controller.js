const Logger = require('../../config/winston');
const responseHelper = require('../utils/responseHelper');

module.exports = function callController(route) {
  const { handler } = route;
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (err) {
      console.log(err);
      if (err.statusCode) {
        Logger.error(err);
        response.status(err.statusCode).json({
          success: false,
          message: err.message,
          type: err.type,
        });
      } else {
        response.status(500).json(responseHelper.error.SOMETHING_WENT_WRONG());
      }
      Logger.error(err);
    }
  };
};
