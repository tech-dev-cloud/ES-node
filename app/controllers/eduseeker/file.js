const fs = require('fs');
const { File, Document } = require('../../models');
const vimeoClient = require('../../../config/vimeo');
const webp = require('webp-converter');
const { aws } = require('../../services');
const config = require('../../../config/config');
const common = require('../../utils/common');

let file = {
  uploadFile: async (request, response) => {
    let fileType = request.file.mimetype.split('/')[0];
    let ContentType = request.file.mimetype;
    let outputPath = `${Date.now()}${request.file.originalname}`;
    if (fileType == "image") {
      outputPath = `${outputPath.split('.')[0]}.webp`;
      await webp.cwebp(request.file.path, outputPath, '-q 100');
      ContentType = 'image/webp';
      fs.readFile(request.file.path, function (error, fileContent) {
        if (!error && fileContent && fileContent != undefined) {
          // fs.unlinkSync(outputPath);
          fs.unlinkSync(request.file.path);
          let params = {
            Bucket: process.env.BUCKET_NAME,
            Body: fileContent,
            ContentType,
            ACL: 'public-read'
          }
          params['Key'] = (config.NODE_ENV == 'development') ? 'dev/' + outputPath : 's1/' + outputPath;
          aws.uploadFileToBucket(params, function (data) {
            response.status(200).json({
              success: true,
              message: "file uploaded successfully",
              imageURL: data.Location
            })
          });
        } else {
          response.status(500).json({
            success: false,
            message: "Something went wrong",
            debug: error
          })
        }
      })
    } else if (fileType == 'video') {
      file.uploadVideo(request.file.path).then(uri => {
        response.status(200).json({
          success: true,
          message: 'Video uploaded successfully',
          data: uri
        })
      }).catch(err => {
        response.status(500).json({
          success: false,
          message: 'Some problem occure during video upload',
          data: err
        })
      })
    }
  },
  rename: (req, file, cb) => {

    cb(null, file.originalname);
  },
  createDocument: async (req, res) => {
    let document = new Document({ ...req.body, user_id: req.user._id });
    await document.save();
    res.status(200).json({
      success: true,
      message: 'Document saved successfully'
    })
  },
  getAllDocuments: async (req, res) => {
    let data = await Document.aggregate([
      { $match: { user_id: req.user._id, $text: { $search: req.query.searchString } } },
      // {$skip:req.}
      // {$limit:req.query.limit},
      { $group: { _id: null, counts: { $sum: 1 }, items: { $push: "$$ROOT" } } },
    ])
    res.status(200).json({
      success: true,
      message: "documents fetched successfully",
      data: data[0]
    })
  },
  createImage: async (req, res) => {
    let data = await common.profileThumbnail(req.body.name);
    res.status(200).json({
      data
    })
  },
  uploadVideo: async (filePath) => {
    return new Promise((resolve, reject) => {
      vimeoClient.upload(filePath, function (uri, err) {
        resolve(uri);
      },
        function (bytesUploaded, bytesTotal) {
          var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          console.log(bytesUploaded, bytesTotal, percentage + '%')
        },
        function (error) {
          reject(error);
        })
    })
  }
};

module.exports = { file };