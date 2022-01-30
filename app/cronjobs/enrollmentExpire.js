const moment = require('moment');
const { Order } = require('../mongo-models');
module.exports = async function (req, res) {
  const day7 = moment().add(7, 'd').format('YYYY-MM-DD');
  const day8 = moment().add(110, 'd').format('YYYY-MM-DD');
  const obj1 = Order.find({
    validity: { $gt: day7, $lt: day8 },
    order_status: 'Credit',
  })
    .populate('user_id')
    .lean();
  const obj2 = Order.find({
    validity: { $lt: new Date() },
    order_status: 'Credit',
  })
    .populate('user_id')
    .lean();
  const [enrollmentExpiresIn7Days, enrollmentExpired] = await Promise.all([
    obj1,
    obj2,
  ]);

  for (const obj of enrollmentExpiresIn7Days) {
    // Send email for enrolment expire in 7 days
  }
  for (const obj of enrollmentExpired) {
    // Send email for enrolment expired
  }
};
