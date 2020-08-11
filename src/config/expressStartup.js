const app = require('express')();
const bodyParser = require('body-parser');
const utils = require('../app/utils/routeUtils');
const routes = require('../app/routes');

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


  /********************************
  ***** For handling CORS Error ***
  *********************************/
  app.all('/*', (request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message');
    response.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS');
    response.header('Access-Control-Max-Age', 1800);
    next();
  });

  process.on('uncaughtException', reason => {
    console.log('uncaughtException', reason);
    process.exit(1);
  })
  process.on('unhandledRejection', reason => {
    console.log('unhandledRejection', reason);
    process.exit(1);
  })

  await utils.initRoutes(app, routes);
  app.listen(process.env.PORT || 4000, () => {
    console.log('server is start at ', process.env.PORT || 4000);

  })

}
module.exports = expressStartup 