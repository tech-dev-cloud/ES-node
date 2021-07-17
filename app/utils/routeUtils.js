const JOI = require('joi');
const Mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const multer = require('multer');

const swaggerJson = require('../../config/swagger');
const swJson = require('../services/swaggerService');
const { authService } = require('../services/authService');
const { file } = require('../controllers');
const logger = require('../../config/winston');
const { SOMETHING_WENT_WRONG } = require('./errorCodes');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: file.rename
});
const upload = multer({ storage: storage });

const routeUtils = {};

routeUtils.initRoutes = async (app, routes = []) => {
  routes.forEach(route => {
    const middlewares = [dataValidation(route)]
    try {
      // if (route.auth) {
      middlewares.push(authService.userValidate(route.auth));
      // }
      if (route.joiSchemaForSwagger.formData) {
        const keys = Object.keys(route.joiSchemaForSwagger.formData);
        keys.forEach((key) => {
          middlewares.push(upload.single(key));
        });
      }
      middlewares.push(getHandlerMethod(route));
      app.route(route.path)[route.method.toLowerCase()](...middlewares)
    } catch (err) {
      console.log('error---->>>>', err);
    }
  })
  createSwaggerUIForRoutes(app, routes)
}

const joiValidation = async (req, route) => {

  if (route.joiSchemaForSwagger.query && Object.keys(route.joiSchemaForSwagger.query).length > 0) {
    req.query = await JOI.validate(req.query, route.joiSchemaForSwagger.query);
  }
  if (route.joiSchemaForSwagger.params && Object.keys(route.joiSchemaForSwagger.params).length > 0) {
    req.params = await JOI.validate(req.params, route.joiSchemaForSwagger.params);

  }
  if (route.joiSchemaForSwagger.body && Object.keys(route.joiSchemaForSwagger.body).length > 0) {
    req.body = await JOI.validate(req.body, route.joiSchemaForSwagger.body);

  }
  if (route.joiSchemaForSwagger.headers && Object.keys(route.joiSchemaForSwagger.headers).length > 0) {
    const headerObject = await JOI.validate(req.headers, route.joiSchemaForSwagger.headers);
    req.headers.authorization = headerObject.authorization;
  }
  if (route.joiSchemaForSwagger.formData && Object.keys(route.joiSchemaForSwagger.formData).length > 0) {
    req.formData = await JOI.validate(req.formData, route.joiSchemaForSwagger.formData);
  }
}



let setMongooseId = () => {
  let joiObject = JOI.string()
  joiObject.mongooseId = function () {
    return this._test('mongodbId', undefined, function (value) {
      return Mongoose.Types.ObjectId(value);
    })
  }
  return joiObject.mongooseId();
}

routeUtils.validation = {
  // titleCase: setTitleCase(),
  mongooseId: setMongooseId().error(new Error('invalid mongoose id')),
  // resourceMongooseId: setMongooseId().required().error(new Error('invalid resource id')).description('mongodb Id of resource to get/update/delete'),
  // numberConvert: Joi.number().options({ convert: true }),
  // statusSetter: Joi.bool().optional().description('true - enable resource, false - deactivate resource (soft delete)'),
  // arrayWithEnumStrings: (enums, minItems, maxItems) => {
  //   let validArray = Joi.array().items(Joi.string().valid(commonFunctions.getEnumArray(enums))).description(stringArrayDescription(enums, minItems, maxItems))
  //   if (minItems) { validArray = validArray.min(minItems) };
  //   if (maxItems) { validArray = validArray.max(maxItems) };
  //   return validArray;
  // },
  // numberEnums: enums => Joi.number().valid(commonFunctions.getEnumArray(enums)).options({ convert: true }).description(getEnumDescription(enums)),
  // get paginator() {
  //   return {
  //     sortDirection: this.numberEnums(CONSTANTS.SORTDIRECTION),
  //     sortKey: Joi.string().optional().description('specify key to sort on basis of e.g. "keyname" for ascending,"-keyname" for descending '),
  //     index: this.numberConvert.optional().default(0).description('start index of records to fetch'),
  //     limit: this.numberConvert.optional().default(20).description('limit of number of records to fetch'),
  //   }
  // },
  // emptyString: Joi.string().allow('').optional()
}


const dataValidation = (route) => {
  return (req, res, next) => {
    joiValidation(req, route)
      .then(() => {
        next()
      }).catch(err => {
        res.status(400).json({ error: err.message });
      });

  }
}
const getHandlerMethod = (route) => {
  const { handler } = route;
  return (req, res) => {
    logger.info(`${route.method}: ${route.path}`);
    try{
      handler(req, res).then(res=>{}).catch(err=>{
        logger.error(err)
        if(err){
          res.status(err.statusCode).json({
            success:false,
            message: err.message,
            type:err.type
          })
          return;
        }
        res.status(500).json({
          success:false,
          message: 'Something went wrong'
        })
      });
    }catch(err){
    }
    // .then(result => {
    //   if (result) {
    //     res.status(200).json(result);
    //   } else {
    //     res.sendStatus(200);
    //   }
    // }).catch(error => {
    //   logger.error('API Error'+error);
    //   console.log(error);
    //   res.status(400).json(error)
    // });
  }
}

let createSwaggerUIForRoutes = (app, routes = []) => {
  const swaggerInfo = swaggerJson.info;

  swJson.swaggerDoc.createJsonDoc(swaggerInfo);
  routes.forEach(route => {
    swJson.swaggerDoc.addNewRoute(route.joiSchemaForSwagger, route.path, route.method.toLowerCase());
  });
  try {
    const swaggerDocument = require('../../swagger.json');
    app.use('/documentation', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  } catch (err) {
    console.log(err.message);
  }

};

module.exports = routeUtils;