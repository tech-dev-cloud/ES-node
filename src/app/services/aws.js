const AWS = require('aws-sdk');
const webp=require('webp-converter');

webp.grant_permission();

let service={}

service.generateWEBPFile=()=>{
    
}

service.uploadFileToBucket=async (params, cb)=>{
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    });
    
    s3.upload(params, function (err, data) {
        if (data) {
            // let s3Url = params.base_s3_img_url + data.key;
            cb(data);
        } else {
            cb(err);
        }
    });
}

module.exports={aws:service}