const MONGOOSE = require('mongoose');
require('dotenv').config();

module.exports = {
  URL: `mongodb://localhost:27017/${process.env.DB_NAME || 'eduseeker'}`,
  start: async function () {
    await MONGOOSE.connect(this.URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    console.log('mongodb is connected on ', this.URL)
  }
}