const config = require('../../../config/config');
const { Product, VideoContent } = require('../../models');
const params = require(`../../../config/env/${config.NODE_ENV}_params.json`);
const controller = {
    createCourse: async (request, response) => {
        let body = request.body;
        body.type = params.product_types.course;
        let course_content = body.course_content;
        let obj = new Product({ ...body, created_by: request.user._id });
        let product = await obj.save();
        if (course_content && course_content.length) {
            course_content = course_content.map(content => ({ ...content, product_id: product._id, created_by: request.user._id }));
            VideoContent.insertMany(course_content);
        }
        response.status(200).json({
            success: true,
            message: 'Successfully created'
        })
    },
    updateCourse: async (request, response) => {
        let courseId = request.params.courseId;
        let body = request.body;
        body.type = params.product_types.course;
        let course_content = body.course_content;
        // let promises = [];
        if (course_content && course_content.length) {
            course_content = course_content.filter(content => !content._id).map(content => ({ ...content, product_id: courseId, created_by: request.user._id }));
            VideoContent.insertMany(course_content);
        }
        await Product.updateOne({ _id: courseId }, body);
        response.status(200).json({
            success: true,
            message: 'Successfully updated'
        })
    },
    getCourseByID: async (request, response) => {
        let product = await Product.aggregate([
            { $match: { _id: request.params.courseId, created_by: request.user._id } },
            { $lookup: { from: 'videocontents', localField: '_id', foreignField: 'product_id', as: 'contentData' } }
        ])
        response.status(200).json({
            success: true,
            message: 'course fetched success',
            data: product[0]
        })
    },
    createCourseContent: async (request, response) => {
        let content = new VideoContent(request.body);
        let obj = await content.save();
        response.status(200).json({
            success: true,
            data: obj
        });
    },
    updateCourseContent: async (request, response) => {
        let contentId = request.params.videoContentId;
        let content = await VideoContent.updateOne({ _id: contentId }, request.body, { new: true });

        response.status(200).json({
            success: true,
            data: content
        })
    }
}
module.exports = { courseController: controller };