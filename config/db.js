const MONGOOSE = require('mongoose');
const logger = require('./winston');

module.exports = {
  URL: `mongodb://localhost:27017/${process.env.DB_NAME || 'eduseeker'}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  start: async function () {
    await MONGOOSE.connect(this.URL, this.options);
    logger.info(`mongodb is connected on ${this.URL}`);
  },
};
