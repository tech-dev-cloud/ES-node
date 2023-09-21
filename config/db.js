const MONGOOSE = require('mongoose');
const Logger = require('./winston');

module.exports = {
  URL: `mongodb://0.0.0.0:27017/${process.env.DB_NAME || 'eduseeker'}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  start: async function () {
    await MONGOOSE.connect(this.URL, this.options);
    Logger.info(`mongodb is connected on ${this.URL}`);
  },
};
