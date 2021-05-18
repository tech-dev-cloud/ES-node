const _ = require('lodash');
const config = require('../../config/config');
let params = require(`../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../config/redisConnection');
const { VideoContentModel, Order, Comment, Product, ProductQuestionMap, Document } = require("../mongo-models");
class ProductService {
    constructor() { }
    async getCourseContent(product_id, enrolled = false) {
        let selectedContentFields = ['_id', 'title', 'lectures'];
        let lectureFields = ['isPreview', 'title', 'description', 'file_type', 'duration', 'url']
        let contents = await VideoContentModel.find({ product_id, status: true }).lean();
        contents = contents.map(content => {
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
        console.log("=====", contents.length)
        return contents;
    }
    getRedirectUrl(product_type) {
        let weburl;
        if (product_type == params.product_types.notes) {
            weburl = `pdf-4`;
        } else if (product_type == params.product_types.quiz) {
            weburl = `quiz-3`;
        } else if (product_type == params.product_types.bulk) {
            weburl = `bulk-2`;
        } else if (product_type == params.product_types.course) {
            weburl = `course-1`;
        }
        return weburl;
    }
    async getUserProductReview(object_id, created_by, type) {
        let data = await Comment.find({ object_id, created_by, type }).lean();
        console.log("---==->>>data---", data)
        return data;
    }
}
let service = {
    async getCourseContent(product_id, enrolled = false) {
        let selectedContentFields = ['_id', 'title', 'lectures'];
        let lectureFields = ['isPreview', 'title', 'description', 'file_type', 'duration', 'url']
        let contents = await VideoContentModel.find({ product_id, status: true }).lean();
        contents = contents.map(content => {
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
        return contents;
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
        // let $sort = { _id: 1 };
        if (last_doc_id) {
            $match._id = { $gt: last_doc_id };
        }
        if (object_id) {
            $match.object_id = object_id;
        }
        $match.parent_id = parent_comment_id || null;
        if (!parent_comment_id) {
            // $sort = { _id: -1 };
        }
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
            weburl = `pdf-4`;
        } else if (product_type == params.product_types.quiz) {
            weburl = `quiz-3`;
        } else if (product_type == params.product_types.bulk) {
            weburl = `bulk-2`;
        } else if (product_type == params.product_types.course) {
            weburl = `course-1`;
        }
        return weburl;
    },
    async totalEnrolled(product_id) {
        let count = await Order.find({ product_id }).count();
        return count;
    },
    getProduct: async (product_id) => {
        console.log("Type of===", typeof product_id)
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
                    product['rating'] = await service.getProductRating(product_id);
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
    getUserProductReview: async (object_id, created_by, type) => {
        return Comment.find({ object_id, created_by, type }).lean();

    },
    getProductRating: async (product_id) => {
        let data = await Comment.find({ object_id: product_id, type: params.review_type.product_review }, { rating: 1 }).lean();
        if (data && data.length) {
            let sum = data.reduce((acc, curvalue) => acc + curvalue.rating, 0);
            return Math.ceil(sum / data.length);
        }
        return 0;
    }
}
module.exports = { productService: service, ProductService: ProductService };