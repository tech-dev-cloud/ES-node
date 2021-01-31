const JOI = require('joi');
const { USER_ROLE, DEFAULT,DB } = require('../../../utils/constants');
const { dummy } = require('../../../controllers');
const routeUtils = require('../../../utils/routeUtils');

let routes=[
    {
        path: `/update/update_question`,
        method: 'GET',
        joiSchemaForSwagger: {
        
            group: 'dummy',
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
        
            group: 'dummy',
            description: 'Api to create question',
            model: 'V2question'
        },
        // auth: [USER_ROLE.TEACHER],
        handler: dummy.products
    },
    {
        path: `/update/orders`,
        method: 'GET',
        joiSchemaForSwagger: {
        
            group: 'dummy',
            description: 'Api to create orders',
            model: 'V2question'
        },
        // auth: [USER_ROLE.TEACHER],
        handler: dummy.orders
    },
]
module.exports=routes;