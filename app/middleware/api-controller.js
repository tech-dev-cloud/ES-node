const Logger = require('../../config/winston');
const responseHelper = require('../utils/responseHelper');

module.exports = function callController(route) {
  const { handler } = route;
  return async (request, response, next) => {
    try {
      await handler(request, response);
      Logger.info(`${route.method}: ${route.path}`);
    } catch (err) {
      Logger.error(`${route.method}: ${route.path}` + err);
      if (err.statusCode) {
        response.status(err.statusCode).json({
          success: false,
          message: err.message,
          type: err.type,
        });
      } else {
        response.status(500).json(responseHelper.error.SOMETHING_WENT_WRONG());
      }
    }
  };
};
