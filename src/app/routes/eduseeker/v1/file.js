
const JOI = require('joi');
const { USER_ROLE, DEFAULT, PRODUCT_TYPE } = require('../../../utils/constants');
const {file}=require('../../../controllers');
let routes=[
    {
        path:'/api/file/upload',
        method:'POST',
        joiSchemaForSwagger: {
            headers: JOI.object({
              authorization: JOI.string()
                .required()
                .description('Access token')
            }).options({ allowUnknown: true }),
            formData: {
              file: JOI.any().meta({ swaggerType: 'file' }).optional().description('Image File'),
            },
            group: 'Files',
            description: 'Route to upload file.',
            model: 'adminFileUpload'
          },
          auth: [USER_ROLE.TEACHER],
          handler: file.uploadFile
    }
]
module.exports=routes;
