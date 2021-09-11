const env = require('dotenv');
env.config();
const { startExpress, DB } = require('./config');

DB.start().then(() => {
  startExpress();
});
