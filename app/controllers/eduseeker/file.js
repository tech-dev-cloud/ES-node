const fs = require('fs');
const { File, Document } = require('../../mongo-models');
const vimeoClient = require('../../../config/vimeo');
const webp = require('webp-converter');
const { aws } = require('../../services');
const config = require('../../../config/config');
const common = require('../../utils/common');
const logger = require('../../../config/winston');
const { SOMETHING_WENT_WRONG } = require('../../utils/errorCodes');

let file = {
  uploadFile: async (request, response) => {
    let fileType = request.file.mimetype.split('/')[0];
    let ContentType = request.file.mimetype;
    let filename = `${Date.now()}${request.file.originalname}`;
    if (fileType == 'image') {
      file.uploadToS3(request.file.path, ContentType, filename);
      console.log(request.body, filename);
      if (!request.query.original) {
        filename = `${filename.split('.')[0]}.webp`;
        await webp.cwebp(request.file.path, filename, '-q 80');
        ContentType = 'image/webp';
      }
    }
    file
      .uploadToS3(request.file.path, ContentType, filename)
      .then((data) => {
        fs.unlinkSync(request.file.path);
        response.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          data,
        });
      })
      .catch((err) => {
        throw SOMETHING_WENT_WRONG;
        // response.status(500).json({
        //   success: false,
        //   message: 'Something went wrong',
        //   err
        // })
      });
  },
  uploadToS3(filepath, ContentType, filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, function (error, fileContent) {
        if (!error && fileContent && fileContent != undefined) {
          let params = {
            Bucket: process.env.BUCKET_NAME,
            Body: fileContent,
            ContentType,
            ACL: 'public-read',
          };
          params['Key'] =
            config.NODE_ENV == 'development'
              ? 'dev/' + filename
              : 's1/' + filename;
          aws.uploadFileToBucket(params, function (data) {
            resolve(data.Location);
          });
        } else {
          reject('Something went wrong');
        }
      });
    });
  },
  rename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  createDocument: async (req, res) => {
    let document = new Document({ ...req.body, user_id: req.user._id });
    await document.save();
    res.status(200).json({
      success: true,
      message: 'Document saved successfully',
    });
  },
  getAllDocuments: async (req, res) => {
    let data = await Document.aggregate([
      {
        $match: {
          user_id: req.user._id,
          $text: { $search: req.query.searchString },
        },
      },
      // {$skip:req.}
      // {$limit:req.query.limit},
      {
        $group: { _id: null, counts: { $sum: 1 }, items: { $push: '$$ROOT' } },
      },
    ]);
    res.status(200).json({
      success: true,
      message: 'documents fetched successfully',
      data: data[0],
    });
  },
  createImage: async (req, res) => {
    let data = await common.profileThumbnail(req.body.name);
    res.status(200).json({
      data,
    });
  },
  uploadVideo: async (filePath) => {
    return new Promise((resolve, reject) => {
      vimeoClient.upload(
        filePath,
        function (uri, err) {
          resolve(uri);
        },
        function (bytesUploaded, bytesTotal) {
          var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(bytesUploaded, bytesTotal, percentage + '%');
        },
        function (error) {
          reject(error);
        }
      );
    });
  },
  temp: async (req, res) => {
    const data = await aws.getSignedURL(req.body);
    res.status(200).json({
      success: true,
      data,
    });
  },
};

module.exports = { file };
