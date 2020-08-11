const CONFIG = require('../../config/config');

module.exports = {
  // ...require(`./${CONFIG.Development.platform}`)
  ...require(`./eduseeker`)
}