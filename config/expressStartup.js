const EXPRESS = require('express');
const app = EXPRESS();
const compression = require('shrink-ray-current');
const cors = require('cors');
const bodyParser = require('body-parser');
const Logger = require('../config/winston');
const initRoutes = require('../app/routes');
console.log('szdvnlf vlkdfj l');
const expressStartup = async () => {
  // app.use(bodyParser.json({ limit: '50mb' }));
  // app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

  /********************************
   ***** Server Configuration *****
   ********************************/
  app.set('port', 4000);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  // app.use(EXPRESS.static(__dirname));
  app.use(compression());

  /********************************
   ***** For handling CORS Error ***
   *********************************/
  app.use(cors());
  app.all('/*', (request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
      'Access-Control-Allow-Headers',
      'Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message'
    );
    response.header(
      'Access-Control-Allow-Methods',
      'POST, GET, DELETE, PUT, OPTION'
    );
    response.header('Access-Control-Allow-Credentials', 'true');
    response.header('Access-Control-Max-Age', 1800);
    next();
  });

  process.on('uncaughtException', (reason) => {
    console.log('uncaughtException', reason);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    console.log('unhandledRejection', reason);
    process.exit(1);
  });
  initRoutes(app, EXPRESS);
  app.listen(process.env.PORT || 4000, () => {
    Logger.info('server is start at port ' + (process.env.PORT || 4000));
  });
  // socket.init(server);
};
module.exports = expressStartup;
