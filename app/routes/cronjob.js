const fs = require('fs');
const path = require('path');
const basePath = path.join(process.cwd(), 'app', 'cronjobs');
const cronController = require('./../controllers/cron');

module.exports = function (app) {
  const files = fs.readdirSync(basePath);
  for (const file of files) {
    const fileName = file.substring(0, file.length - 3);
    app.get(`/cron/${fileName}`, cronController);
  }
};
