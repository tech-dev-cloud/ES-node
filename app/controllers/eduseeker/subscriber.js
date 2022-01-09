const { userService } = require('../../services');

const controller = {
  subscribeForNewUpdates: async (request, response) => {
    const body = request.body;
    try {
      const data = await userService.subscribeForNewUpdates(body);
      response.status(200).json({
        success: true,
        message: 'Subscribed successfully',
        data,
      });
    } catch (err) {
      if (err && err.statusCode) {
        response.status(err.statusCode).json(err);
      }
      console.log(err);
    }
  },
};

module.exports = { userController: controller };
