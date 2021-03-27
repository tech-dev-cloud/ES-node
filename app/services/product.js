const _ = require('lodash');
const { VideoContent } = require("../models");

let service = {
    getCourseContent: async (product) => {
        let selectedContentFields = ['_id', 'title', 'lectures'];
        let lectureFields = ['isPreview', 'title', 'description', 'file_type', 'duration']
        let contents = await VideoContent.find({ product_id: product._id, status: true }).lean();
        product.contents = contents.map(content => {
            content = _.pick(content, selectedContentFields);
            content.lectures = content.lectures.map(lecture => {
                lecture = _.pick(lecture, lectureFields);
                return lecture;
            })
            content.lectureCounts = content.lectures.length;
            content.duration = content.lectures.reduce((accum, currentValue) => accum + currentValue.duration, 0);
            return content;
        })
    }
}
module.exports = service;