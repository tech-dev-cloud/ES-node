const { constant } = require('async');
const JOI=require('joi');
const { MODULES } = require('../../utils/constants');
const { stayTuned } = require('./controller');

module.exports=[
  {
    path: '/api/stay-tuned',
    method: 'POST',
    joiSchemaForSwagger: {
      body: JOI.object({
        name: JOI.string().required(),
        email: JOI.string().email().required(),
      }),
      group: MODULES.notification,
      description: 'Api to subscribe for Updates',
      model: 'SubscribeForNewUpdates',
    },
    handler: stayTuned,
  },
]