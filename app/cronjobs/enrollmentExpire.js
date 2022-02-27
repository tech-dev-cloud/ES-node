const moment = require('moment');
const Email = require('../modules/notification/email-service');
const {
  EmailSubjects,
} = require('../modules/notification/notification-constants');
const { Order } = require('../mongo-models');
module.exports = async function (req, res) {
  const day7 = moment().add(7, 'd').format('YYYY-MM-DD');
  const day8 = moment().add(110, 'd').format('YYYY-MM-DD');
  const obj1 = Order.find({
    validity: { $gt: day7, $lt: day8 },
    order_status: 'Credit',
  })
    .populate('user_id')
    .populate('product_id')
    .lean();
  const obj2 = Order.find({
    validity: { $lt: new Date() },
    order_status: 'Credit',
  })
    .populate('user_id')
    .populate('product_id')
    .lean();
  const [enrollmentExpiresIn7Days, enrollmentExpired] = await Promise.all([
    obj1,
    obj2,
  ]);
  console.log(enrollmentExpiresIn7Days, enrollmentExpired);
  for (const obj of enrollmentExpiresIn7Days) {
    if (obj.user_id && obj.product_id) {
      const initData = {
        subject: EmailSubjects.expireInXDays
          .replace('{{productName}}', obj.product_id.name)
          .replace('{{expireDate}}', obj.validity),
      };
      const email = new Email(initData);
      email.pulishEnrollmentExpireNotification(
        obj.user_id,
        obj.product_id,
        obj.validity
      );
    }
  }
  for (const obj of enrollmentExpired) {
    if (obj.user_id && obj.product_id) {
      const initData = {
        subject: EmailSubjects.expireToday.replace(
          '{{productName}}',
          obj.product_id.name
        ),
      };
      const email = new Email(initData);
      email.pulishEnrollmentExpireNotification(
        obj.user_id,
        obj.product_id,
        new Date()
      );
    }
  }
};
