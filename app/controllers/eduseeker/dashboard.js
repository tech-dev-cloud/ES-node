const { Order, UserModel, Product } = require('../../mongo-models');
const { USER_ROLE } = require('../../utils/constants');
const controller = {
  getStats: async (request, response) => {
    const orders = Order.aggregate([
      { $match: { instructor_id: request.user._id, order_status: 'Credit' } },
      {
        $group: {
          _id: null,
          totoalCounts: { $sum: 1 },
          amount: { $sum: '$final_price' },
        },
      },
    ]);
    const users = UserModel.find({ role: USER_ROLE.STUDENT }).count();
    const products = Product.find({ created_by: request.user._id }).count();
    const result = await Promise.all([orders, users, products]);
    response.status(200).json({
      success: true,
      message: 'data successfully fetched',
      data: {
        totalOrders: result[0][0],
        totalUser: result[1],
        totalProducts: result[2],
      },
    });
  },
};
module.exports = { dashboardController: controller };
