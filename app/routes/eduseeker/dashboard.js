const JOI = require('joi');
const { dashboardController } = require('../../controllers');
const { USER_ROLE } = require('../../utils/constants');

const routes = [
  {
    path: '/api/statsData',
    method: 'GET',
    joiSchemaForSwagger: {
      headers: JOI.object({
        authorization: JOI.string().required(),
      }).unknown(),
      group: 'Dashboard',
      description: 'API to get Dashboard stats',
      model: 'GetStats',
    },
    auth: [USER_ROLE.ADMIN, USER_ROLE.TEACHER],
    handler: dashboardController.getStats,
  },
];
module.exports = routes;
