const CryptoJS = require('crypto-js');
const MESSAGES = require('../../utils/messages');
const { paymentService, productService } = require('../../services');
const { Order, UserModel } = require('../../mongo-models');
const { config } = require('../../../config/config');
const params = require(`../../../config/env/${config.NODE_ENV}_params.json`);
const common = require('../../utils/common');
const product = require('../../services/product');
const { order_status } = require('../../utils/constants');
const { SOMETHING_WENT_WRONG } = require('../../utils/errorCodes');
const Email = require('../../modules/notification/email-service');
const debug = require('../../../config/debugger');

const paymentController = {
  createOrder: async (request, response) => {
    //Add user details
    const paymentObject = {
      buyer_name: request.user.name,
      email: request.user.email,
      phone: request.user.phoneNumber,
    };
    const product = await productService.getProduct(request.body.productId);
    const criteria = {
      user_id: request.user._id,
      product_id: request.body.productId,
      order_status: { $in: ['Free', 'Credit'] },
    };
    if (product.validity) {
      criteria['validity'] = { $gte: new Date() };
    }
    const purchased = await Order.findOne(criteria).lean();
    if (!purchased) {
      paymentObject.amount = product.price;
      paymentObject.purpose = product.name;
      if (!product.isPaid) {
        await paymentService.freeEnrolled(request.user, product);
        return response.status(200).json({
          success: true,
          message: MESSAGES.PAYMENT.SUCCESS,
        });
      }
      paymentObject.webhook = params.backend_server + params.payment_webhook;
      paymentObject.redirect_url =
        params.frontend_server + params.payment_redirection;
      const data = await paymentService.createPayment(
        paymentObject,
        product,
        request.user
      );
      return response.status(200).json({
        success: true,
        message: MESSAGES.PAYMENT.SUCCESS,
        data,
      });
    }
    response.status(400).json({
      success: true,
      message: 'Already purchased',
    });
  },
  webhook: async (request, response) => {
    const payload = request.body;
    const order = await Order.findOne({
      payment_request_id: payload.payment_request_id,
    });
    if (order && order.order_status != 'Credit') {
      const providedMac = payload.mac;
      delete payload.mac;
      delete payload.user;
      delete payload.file;
      delete payload.web_app;
      const data = Object.keys(payload)
        .sort()
        .map((key) => payload[key])
        .join('|');
      const calculatedMac = CryptoJS.HmacSHA1(data, config.PRIVATE_SALT);
      order.order_status = payload.status;
      if (providedMac == calculatedMac.toString()) {
        const product = await productService.getProduct(order.product_id);
        if (product.type == params.product_types.bulk) {
          let validity = new Date();
          validity = new Date(
            validity.setMonth(validity.getMonth() + product.validity)
          );
          const sub_products = await Promise.all(
            product.sub_products.map(async (id) => {
              const obj = await productService.getProduct(id);
              const subproduct_order = {
                user_id: order.user_id,
                parent_product_id: order._id,
                product_id: id,
                product_type: obj.type,
                product_name: obj.name,
                product_image: product.image.map((obj) => obj.image_path),
                order_status: payload.status,
              };
              if (product.validity) {
                subproduct_order['validity'] = validity;
              }
              return subproduct_order;
            })
          );
          Order.insertMany(sub_products).then((res) => {});
        }
        order.save().then((res) => {});
        const user = await UserModel.findOne({ _id: order.user_id }).lean();
        const emailObj = new Email({
          subject: 'Thank you for purchasing ' + product.name,
        });
        emailObj.publishThankyouNotification(user, product);
      } else {
        order.order_status = 'Failed';
        order.save().then((res) => {});
      }
    } else {
      debug.info({
        payload,
        order,
      });
    }
    response.status(200).json({
      success: true,
      message: 'webhook executed successfully',
    });
  },
  getOrders: async (request, response) => {
    const $addFields = {};
    const match = { instructor_id: request.user._id };
    const itemPerPage = parseInt(request.query.limit || '0') || 10;
    const skip = parseInt(request.query.skip || '0') * itemPerPage;

    if (request.query.order_status) {
      match['order_status'] = request.query.order_status;
    }
    if (request.query.createdAt) {
      $addFields['creationDate'] = {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$createdAt',
          timezone: '+0530',
        },
      };
      match['creationDate'] = request.query.createdAt;
    }
    let query = [];
    let query2 = [];
    if (Object.keys($addFields).length) {
      query[0] = { $addFields };
      query2[0] = { $addFields };
    }
    query = [
      ...query,
      { $match: match },
      {
        $lookup: {
          localField: 'user_id',
          foreignField: '_id',
          from: 'users',
          as: 'userData',
        },
      },
      { $unwind: '$userData' },
      {
        $project: {
          product_name: 1,
          product_image: 1,
          final_price: 1,
          order_status: 1,
          validity: 1,
          payment_request_id: 1,
          user_id: 1,
          'userData.name': 1,
          'userData.email': 1,
          createdAt: 1,
        },
      },
      { $sort: { _id: -1 } },
      { $skip: skip },
      { $limit: itemPerPage },
    ];
    match['order_status'] = 'Credit';
    query2 = [
      ...query2,
      { $match: match },
      {
        $group: {
          _id: null,
          totoalCounts: { $sum: 1 },
          amount: { $sum: '$final_price' },
        },
      },
    ];
    const allOrdersQuery = Order.aggregate(query);
    const totalAmount = Order.aggregate(query2);
    Promise.all([allOrdersQuery, totalAmount])
      .then((result) => {
        response.status(200).json({
          success: true,
          data: { orders: result[0], stats: result[1][0] },
        });
      })
      .catch((err) => {
        throw SOMETHING_WENT_WRONG;
        // response.status(500).json({
        //   success: false,
        //   message: 'something went wrong',
        //   err
        // })
      });
  },
  async addOrderAfterPayment(request, response) {
    const promises = [];
    const productIds = request.body.product_ids;
    for (let index = 0; index < productIds.length; index++) {
      promises.push(productService.getProduct(productIds[index]));
    }
    const products = await Promise.all(promises);
    const user = await UserModel.findOne(
      { email: request.body.email },
      { _id: 1 }
    ).lean();
    try {
      if (!products.some((product) => product.created_by == request.user._id)) {
        throw 'Unauthorize access';
      }
      if (!user) {
        throw 'this account is not found';
      }
    } catch (err) {
      response.status(400).json({
        success: false,
        message: err,
      });
      return;
    }

    let validity;
    if (product.validity) {
      validity = new Date();
      validity = new Date(
        validity.setMonth(validity.getMonth() + product.validity)
      );
    }
    for (let index = 0; index < products.length; index++) {
      const order = new Order({
        product_id: products[index]._id,
        product_name: products[index].name,
        product_type: products.type,
        product_image: [product.cover_image],
        final_price: request.body.price,
        user_id: user._id,
        validity,
        order_status: order_status.credit,
      });
      await order.save();
    }
    response.status(200).json({
      success: true,
      message: 'User enrolled successfully',
    });
  },
};

module.exports = { paymentController };
