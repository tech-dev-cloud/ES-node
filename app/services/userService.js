const { PaymentModel, UserModel } = require('../mongo-models');
const errorCodes = require('../utils/errorCodes');

const userService = {
  subscribeForNewUpdates: async (userPayload) => {
    const user = await UserModel.findOne({ email: userPayload.email }).lean();
    if (user && !user.subscribeForNewUpdates) {
      return UserModel.updateOne(
        { _id: user._id },
        {
          subscribeForNewUpdates: true,
        }
      );
    } else if (!user) {
      const data = {
        ...userPayload,
        subscribeForNewUpdates: true,
      };
      const obj = new UserModel(data);
      return obj.save();
    } else {
      throw errorCodes.ALREADY_SUBSCRIBED;
    }
  },
};

userService.findUserProducts = async (payload) => {
  const productLookup = {
    from: 'quizzes',
    localField: 'productId',
    foreignField: '_id',
    as: 'products',
  };
  const match = { $match: { status: 'Credit', userId: payload.user.userId } };

  const query = [
    match,
    { $lookup: productLookup },
    { $project: { products: 1 } },
  ];
  return PaymentModel.aggregate(query);
};

/**Function to get user  */
userService.getUser = async (criteria) => {
  return UserModel.findOne(criteria).lean();
};

module.exports = { userService };
