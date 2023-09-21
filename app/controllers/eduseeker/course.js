const { config } = require('../../../config/config');
const Mongoose = require('mongoose');
const logger = require('../../../config/winston');
const { Product, VideoContentModel } = require('../../mongo-models');
const { SOMETHING_WENT_WRONG } = require('../../utils/errorCodes');
const params = require(`../../../config/env/${config.NODE_ENV}_params.json`);
const controller = {
  createCourse: async (request, response) => {
    let body = request.body;
    body.type = params.product_types.course;
    let course_content = body.course_content;
    let obj = new Product({ ...body, created_by: request.user._id });
    let product = await obj.save();
    if (course_content && course_content.length) {
      course_content = course_content.map((content) => ({
        ...content,
        product_id: product._id,
        created_by: request.user._id,
      }));
      VideoContentModel.insertMany(course_content);
    }
    response.status(200).json({
      success: true,
      message: 'Successfully created',
    });
  },
  updateCourse: async (request, response) => {
    let courseId = request.params.courseId;
    let body = request.body;
    body.type = params.product_types.course;
    let course_content = body.course_content;
    let promises = [];
    if (course_content && course_content.length) {
      course_content = course_content
        .filter((content) => !content._id)
        .map((content) => ({
          ...content,
          product_id: courseId,
          created_by: request.user._id,
        }));
      let promise = VideoContentModel.insertMany(course_content);
      promises.push(promise);
    }
    if (request.body.deleteContentIds && request.body.deleteContentIds.length) {
      let promise = VideoContentModel.deleteMany({
        _id: { $in: request.body.deleteContentIds },
      });
      promises.push(promise);
    }
    let obj = Product.updateOne({ _id: courseId }, body);
    promises.push(obj);
    try {
      await Promise.all(promises);
      response.status(200).json({
        success: true,
        message: 'Successfully updated',
      });
    } catch (err) {
      logger.error(err);
      throw SOMETHING_WENT_WRONG;
      // response.status(500).json({
      //     success: false,
      //     message: err.message
      // })
    }
  },
  getCourseByID: async (request, response) => {
    let product = await Product.aggregate([
      {
        $match: { _id: Mongoose.Types.ObjectId(request.params.courseId), created_by: Mongoose.Types.ObjectId(request.user._id) },
      },
      {
        $lookup: {
          from: 'videocontents',
          localField: '_id',
          foreignField: 'product_id',
          as: 'contentData',
        },
      },
    ]);
    response.status(200).json({
      success: true,
      message: 'course fetched success',
      data: product[0],
    });
  },
  createCourseContent: async (request, response) => {
    let content = new VideoContentModel(request.body);
    let obj = await content.save();
    response.status(200).json({
      success: true,
      data: obj,
    });
  },
  updateCourseContent: async (request, response) => {
    let contentId = request.params.videoContentId;
    let content = await VideoContentModel.update(
      { _id: contentId },
      request.body,
      { new: true }
    );

    response.status(200).json({
      success: true,
      data: content,
    });
  },
};
module.exports = { courseController: controller };
