// const CONFIG = require('../../config/config');

module.exports = [
  ...require('./eduseeker'),
  ...require('./admin'),
  ...require('../modules/offer/routes'),
  ...require('../modules/notification/routes'),
];
