const path = require('path');
const basePath = path.join(process.cwd(), 'app', 'cronjobs');
module.exports = function (request, response) {
  const fileName = request.route.path.split('/')[2];
  require(path.join('../cronjobs/', fileName))(request);
  response.sendStatus(200);
};
