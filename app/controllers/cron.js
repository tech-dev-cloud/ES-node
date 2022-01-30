const path = require('path');
const basePath = path.join(process.cwd(), 'app', 'cronjobs');
module.exports = function (request, response) {
  console.log('req', request.route.path.split('/'));
  const fileName = request.route.path.split('/')[2];
  console.log(path.relative(process.cwd(), path.join(basePath, fileName)));
  require(path.join('../cronjobs/', fileName))(request);
  response.sendStatus(200);
};
