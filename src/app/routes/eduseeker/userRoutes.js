const JOI = require('joi');
const { USER_ROLE } = require('../../../utils/constants');
const { userController } = require('../../../controllers');

const MODULE = {
  name: 'user',
  group: 'User'
}
const routes = [
  {
    path: `/api/${MODULE.name}/products`,
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        'authorization': JOI.string().required()
      }).unknown(),
      group: MODULE.group,
      description: 'Api to get user purchased products',
      model: 'CreatePayment'
    },
    auth: [USER_ROLE.STUDENT],
    handler: userController.findUserProducts
  }
]
module.exports = routes;