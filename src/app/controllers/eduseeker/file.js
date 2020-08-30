const fs=require('fs');
const {File}=require('../../models')
const webp=require('webp-converter');
const {aws}=require('../../services');
const responseHelper = require('../../utils/responseHelper');

let file={};



file.uploadFile=async(payload)=>{

  let outputPath=`${Date.now()}${payload.file.originalname.split('.')[0]}.webp`;
  await webp.cwebp(payload.file.path, outputPath, '-q 100');
  let imageURL=await new Promise((resolve, reject)=>{
    fs.readFile(outputPath, function(error, fileContent){
      if (!error && fileContent && fileContent != undefined) {
        fs.unlinkSync(outputPath);
        fs.unlinkSync(payload.file.path);
        let params={
          Bucket: process.env.BUCKET_NAME,
          Key:'s1/'+outputPath,
          Body: fileContent,
          ContentType: 'image/webp',
          ACL: 'public-read'
        }
        
        aws.uploadFileToBucket(params, function(data){
          resolve(data.Location);
        });
      }else{
        reject(error);
      }
    })
  })
  return responseHelper.createSuccessResponse(null,{imageURL});
}

file.rename=(req, file, cb)=>{
  
  cb(null, file.originalname);
}
module.exports={file};