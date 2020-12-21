const fs=require('fs');
const {File}=require('../../models')
const webp=require('webp-converter');
const {aws}=require('../../services');
const config=require('../../../config/config')
const responseHelper = require('../../utils/responseHelper');

let file={};



file.uploadFile=async(request, response)=>{
  let imageType=request.file.mimetype.split('/')[0];
  ContentType=request.file.mimetype;
  let outputPath=`${Date.now()}${request.file.originalname}`;
  if(imageType=="image"){
    outputPath=`${outputPath.split('.')[0]}.webp`;
    await webp.cwebp(request.file.path, outputPath, '-q 100');
    ContentType='image/webp';
  }
    fs.readFile(request.file.path, function(error, fileContent){
      if (!error && fileContent && fileContent != undefined) {
        // fs.unlinkSync(outputPath);
        fs.unlinkSync(request.file.path);
        let params={
          Bucket: process.env.BUCKET_NAME,
          Body: fileContent,
          ContentType,
          ACL: 'public-read'
        }
        params['Key']=(config.NODE_ENV=='development')?'dev/'+outputPath:'s1/'+outputPath;
        aws.uploadFileToBucket(params, function(data){
          response.status(200).json({
            success:true,
            message:"file uploaded successfully",
            imageURL:data.Location
          })
        });
      }else{
        response.status(500).json({
          success:false,
          message:"Something went wrong",
          debug:error
        })
      }
    })
  // return responseHelper.createSuccessResponse(null,{imageURL});
}

file.rename=(req, file, cb)=>{
  
  cb(null, file.originalname);
}
module.exports={file};