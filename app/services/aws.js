const AWS = require('aws-sdk');
const webp = require('webp-converter');

webp.grant_permission();

const service = {};

service.generateWEBPFile = () => {};

service.uploadFileToBucket = async (params, cb) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  s3.upload(params, function (err, data) {
    if (data) {
      cb(data);
    } else {
      cb(err);
    }
  });
};

service.deleteFile = async (params) => {
  new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    s3.deleteObject(params, function (err, data) {
      if (!err && data) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
};

service.sendEmail = async (params) => {
  const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'ap-south-1',
  });
  return ses.sendEmail(params).promise();
};
service.getSignedURL = async (params) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
  return new Promise((resolve, reject) => {
    const Key = `${Date.now()}${params.fileName}`;
    return s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'eduseeker-image-bucket',
        ContentType: params.contentType,
        Key,
      },
      (err, url) => {
        if (!err) {
          resolve(url);
        } else {
          reject(err);
        }
      }
    );
  });
};

module.exports = { aws: service };
