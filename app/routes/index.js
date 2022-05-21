const multer = require('multer');
const cronjob = require('./cronjob');
const { userAuthentication } = require('../middleware/api-auth');
const callController = require('../middleware/api-controller');
const createSwaggerUIForRoutes = require('../utils/swagger-util');
const joiRequestValidation = require('../utils/validator');
const { authService } = require('../services');

const storage = multer.diskStorage({
  destination: 'uploads/',
});
const upload = multer({ storage: storage });
const routes = [
  ...require('./eduseeker'),
  ...require('./admin'),
  ...require('../modules/offer/routes'),
  ...require('../modules/notification/notification-routes'),
  ...require('../modules/product/product-routes'),
  ...require('../modules/users/user-route'),
  ...require('../modules/product/product-routes'),
  ...require('../modules/subjects/subject-route'),
];
function initRoutes(app, express) {
  const v1Routes = [];
  const v2Routes = [];
  for (const route of routes) {
    switch (route.version) {
      case 'v1':
        v1Routes.push(route);
        break;
      case 'v2':
        v2Routes.push(route);
        break;
      default:
        v1Routes.push(route);
    }
  }
  const routerV1 = express.Router();
  registerRoutes(app, routerV1, '/v1', v1Routes);
  cronjob(app);
}

function registerRoutes(app, router, routeVersion, routes = []) {
  routes.forEach((route) => {
    const middlewares = [dataValidation(route)];
    if (route.authType) {
      middlewares.push(userAuthentication(route.authType));
    } else if (route.auth && route.auth.length) {
      middlewares.push(authService.userValidate(route.auth));
    }

    if (route.joiSchemaForSwagger && route.joiSchemaForSwagger.formData) {
      const keys = Object.keys(route.joiSchemaForSwagger.formData);
      keys.forEach((key) => {
        middlewares.push(upload.single(key));
      });
    }
    middlewares.push(callController(route));
    app.use(routeVersion, router);
    let routePath = '';
    if (route.version) {
      routePath = `/${route.version}${route.path}`;
    } else {
      routePath = route.path;
    }

    app.route(routePath)[route.method.toLowerCase()](...middlewares);
  });
  createSwaggerUIForRoutes(app, routes);
}

function dataValidation(route) {
  return async (request, response, next) => {
    await joiRequestValidation(request, route);
    next();
  };
}

module.exports = initRoutes;
