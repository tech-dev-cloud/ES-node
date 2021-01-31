const JOI = require('joi');
const { USER_ROLE, DEFAULT,DB } = require('../../../utils/constants');
const { dummyController } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

let routes=[
    {
        path: `/update/update_question`,
        method: 'GET',
        joiSchemaForSwagger: {
        
            group: 'V2_Question',
            description: 'Api to create question',
            model: 'V2question'
        },
        // auth: [USER_ROLE.TEACHER],
        handler: dummy.questions
    },
    {
        path: `/update/products`,
        method: 'GET',
        joiSchemaForSwagger: {
        
            group: 'V2_products',
            description: 'Api to create question',
            model: 'V2question'
        },
        // auth: [USER_ROLE.TEACHER],
        handler: dummy.products
    },
]