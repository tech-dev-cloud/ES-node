require('dotenv').config();
const { startExpress, DB } = require('./config');

(async function () {
  startExpress();
  await DB.start();

})()

