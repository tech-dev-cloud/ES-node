const JOI = require('joi');
const routeUtils = require('../../utils/routeUtils');
const {taxonomy} = require('../../controllers');
const { USER_ROLE } = require('../../utils/constants');

const routes = [
    {
      path: '/taxonomy',
      method: 'POST',
      joiSchemaForSwagger: {
        body: JOI.object({
          name: JOI.string().required(),
          parent_id: routeUtils.validation.mongooseId,
          description: JOI.string().required(),
          status: JOI.boolean(),
          icon: JOI.string(),
          banner: JOI.string(),
          hindiBanner: JOI.string(),
        }),
        group: 'Taxonomy',
        description: 'Api to add new tag',
        model: 'AddTaxonomy'
      },
      auth: [USER_ROLE.ADMIN],
      handler: taxonomy.createTaxonomy
    }
]