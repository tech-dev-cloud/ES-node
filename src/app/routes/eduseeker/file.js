
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
          auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
          handler: file.uploadFile
    },
    {
      path:'/api/documents',
        method:'POST',
        joiSchemaForSwagger: {
            headers: JOI.object({
              authorization: JOI.string()
                .required()
                .description('Access token')
            }).options({ allowUnknown: true }),
            body:{
              url:JOI.string().required(),
              filename:JOI.string().required(),
              size:JOI.string(),
              status:JOI.boolean(),
              mime_type:JOI.string(),
              type:JOI.string(),
              priority:JOI.number()
            },
            group: 'Documents',
            description: 'Route to upload Create document.',
            model: 'CreateDocument'
          },
          auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
          handler: file.createDocument
    },
    {
      path:'/api/documents',
        method:'GET',
        joiSchemaForSwagger: {
          headers: JOI.object({
            authorization: JOI.string()
              .required()
              .description('Access token')
          }).options({ allowUnknown: true }),
          query:{
            searchString:JOI.string()
          },
          group: 'Documents',
          description: 'Route to upload Create document.',
          model: 'CreateDocument'
        },
        auth: [USER_ROLE.TEACHER, USER_ROLE.ADMIN],
        handler: file.getAllDocuments
    }
]
module.exports=routes;
