
const JOI = require('joi');
let routes = [
    {
        path: '/api/updateProductType',
        method: 'POST',
        joiSchemaForSwagger: {
            headers: JOI.object({
                authorization: JOI.string()
                    .required()
                    .description('Access token')
            }).unknown()
        }
    }
]
module.exports = routes;