const JOI = require('joi');
const routeUtils = require('../../utils/routeUtils');
const { taxonomy } = require('../../controllers');

module.exports = [
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
      model: 'AddTaxonomy',
    },
    handler: taxonomy.createTaxonomy,
  },
];
