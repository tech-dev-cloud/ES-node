const Logger = require('../../config/winston');

module.exports = function callController(route) {
  const { handler } = route;
  return async (request, response, next) => {
    try {
      await handler(request, response);
    } catch (err) {
      if (err.code) {
        response.status(err.code).json(err);
      } else {
        Logger.error(err.stack);
        response.status(500).json({
          message: 'Something went wrong',
          success: false,
        });
      }
    }
  };
};
