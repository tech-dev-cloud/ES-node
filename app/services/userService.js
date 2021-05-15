
const { ERROR_TYPE, MONGO_ERROR, EMAIL_TYPES } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const commontFunction = require('../utils/commonFunctions');
const sendMail = require('./nodemailerService');
const util = require('../utils/utils');
const { PaymentModel, UserModel } = require('../mongo-models');
const responseHelper = require('../utils/responseHelper');

let userService = {}

userService.findUserProducts = async (payload) => {
  let productLookup = { from: 'quizzes', localField: 'productId', foreignField: '_id', as: 'products' };
  let match = { $match: { status: 'Credit', userId: payload.user.userId } }

  let query = [
    match,
    { $lookup: productLookup },
    { $project: { products: 1 } }
  ]
  const data = (await PaymentModel.aggregate(query));
  return data;
}

/**Function to get user  */
userService.getUser = async (criteria) => {
  return await UserModel.findOne(criteria).lean();
}

module.exports = { userService };