const _ = require('lodash');
const config = require('../../config/config');
let params = require(`../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../config/redisConnection');
const { VideoContent, Order, Comment, Product, ProductQuestionMap, Document } = require("../models");

let service = {
    getCourseContent: async (product, enrolled = false) => {
        let selectedContentFields = ['_id', 'title', 'lectures'];
        let lectureFields = ['isPreview', 'title', 'description', 'file_type', 'duration', 'url']
        let contents = await VideoContent.find({ product_id: product._id, status: true }).lean();
        product.contents = contents.map(content => {
            if (!enrolled) {
                content = _.pick(content, selectedContentFields);
                content.lectures = content.lectures.map(lecture => {
                    lecture = _.pick(lecture, lectureFields);
                    if (!lecture.isPreview) {
                        delete lecture.url;
                    }
                    return lecture;
                })
            }
            content.lectureCounts = content.lectures.length;
            content.duration = content.lectures.reduce((accum, currentValue) => accum + currentValue.duration, 0);
            return content;
        })
    },
    /**
     * Function Check whether spesified user purchased spesific product of not 
     * @param {*} product_id 
     * @param {*} user_id 
     * @returns {*} {purchased, validity}
     */
    async isProductPurchased(product_id, user_id) {
        let purchaseData = await Order.findOne({ product_id, user_id: user_id, order_status: 'Credit' }).lean();
        if (purchaseData) {
            return {
                purchased: true,
                validity: purchaseData.validity
            }
        }
        return {
            purchased: false
        }
    },
    async getComments(object_id, parent_comment_id, type, last_doc_id, limit) {
        let $match = { type };
        if (last_doc_id) {
            $match._id = { $gt: last_doc_id };
        }
        if (object_id) {
            $match.object_id = object_id;
        }
        $match.parent_id = parent_comment_id || null;
        // if (parent_comment_id) {
        // } else {
        //     $match.parent_id = null;
        // }
        let $lookup = { from: 'users', localField: 'created_by', foreignField: '_id', as: 'user' };
        let $unwind = '$user';
        let $project = { "user.createdAt": 0, "user.password": 0 };
        let $limit = limit;
        let query = [{ $match }, { $lookup }, { $unwind }, { $project }, { $limit }];
        let data = await Comment.aggregate(query);
        return data;
    },
    getRedirectUrl(product_type) {
        let weburl;
        if (product_type == params.product_types.notes) {
            // item.id = 4;
            // item.title = "PDF/E-Books";
            weburl = `pdf-4`;
            // data.push(item);
        } else if (product_type == params.product_types.quiz) {
            // item.id = 3;
            // item.title = "Quiz";
            weburl = `quiz-3`;
            // data.push(item);
        } else if (product_type == params.product_types.bulk) {
            // item.id = 2;
            // item.title = "Bulk Package";
            weburl = `bulk-2`;
            // data.push(item);
        } else if (product_type == params.product_types.course) {
            // item.id = 1;
            // item.title = "Latest Courses";
            weburl = `course-1`;
            // data.push(item);
        }
        return weburl;
    },
    async totalEnrolled(product_id) {
        let count = await Order.find({ product_id }).count();
        return count;
    },
    getProduct: async (product_id) => {
        let cacheKey = `${params.product_cache_key}${product_id.toString()}`;
        return new Promise((resolve, reject) => {
            redis.get(cacheKey, async (err, someData) => {
                let product;
                if (!err && !someData) {
                    let match = {};
                    match['_id'] = product_id;
                    let data = await Product.aggregate([
                        { $match: match },
                        {
                            $lookup: {
                                from: "product_images",
                                let: { "id": "$_id" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$product_id", "$$id"] } } },
                                    { $project: { image_path: 1 } }
                                ],
                                as: "image"
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                let: { "id": "$created_by" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                                    { $project: { name: 1 } }
                                ],
                                as: "mentorInfo"
                            }
                        },
                        { $unwind: "$mentorInfo" }
                    ]);
                    redis.set(cacheKey, JSON.stringify(data[0]), () => {
                        redis.expire(cacheKey, params.product_cache_expiry);
                    });
                    product = data[0];
                } else {
                    product = JSON.parse(someData);
                }
                if (product) {
                    if (product.strikeprice) {
                        product['discountPercent'] = Math.ceil((product.strikeprice - product.price) * 100 / product.strikeprice);
                    }
                    product.image = product.image.map(prod_image => prod_image.image_path);
                    product['weburl'] = service.getRedirectUrl(product.type);
                }
                resolve(product);
            })
        })
    },
    getProductMeta: async (product) => {
        let data;
        switch (product.type) {
            case "1":
                data = await Document.find({ product_id: product._id, status: true }).lean();
                break;
            case "2":
                data = await ProductQuestionMap.find({ product_id: product._id, status: true }).lean();
                data = await ProductQuestionMap.aggregate([
                    { $match: { product_id: product._id, status: true } },
                    { $project: { question_id: 1 } },
                    {
                        $lookup: {
                            from: "questions",
                            localField: "question_id",
                            foreignField: "_id",
                            as: "questionData"
                        }
                    },
                    { $unwind: "$questionData" },
                    {
                        $project: {
                            "questionData._id": 1, "questionData.options": 1, "questionData.correctOption": 1, "questionData.subjectId": 1, "questionData.question": 1, "questionData.description": 1,
                            "questionData.moduleId": 1, "questionData.type": 1
                        }
                    }
                ])
                break;
        }
        return data;
    },
}
module.exports = { productService: service };