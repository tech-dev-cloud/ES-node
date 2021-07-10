const _ = require('lodash');
const config = require('../../config/config');
let params = require(`../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../config/redisConnection');
const { VideoContentModel, Order, Comment, Product, ProductQuestionMap, Document } = require("../mongo-models");
const { order_status } = require('../utils/constants');
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
        let purchaseData = await Order.findOne({ product_id, user_id: user_id, order_status: { $in: ['Credit', 'Free'] } }).lean();
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
    async getComments(object_id, parent_comment_id, review_type, last_doc_id, limit) {
        let $match = { type: review_type };
        // let $sort = { _id: 1 };
        if (last_doc_id) {
            $match._id = { $gt: last_doc_id };
        }
        if (object_id) {
            $match.object_id = object_id;
        }
        $match.parent_id = parent_comment_id || null;
        // if (!parent_comment_id) {
        //     $sort = { _id: -1 };
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
    async totalEnrolled(product_id, orderStatus = []) {
        orderStatus = orderStatus.length ? orderStatus : Object.values(order_status);
        let count = await Order.find({ product_id, order_status: { $in: orderStatus } }).count();
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
                    let obj = service.getProductRating(product_id);
                    let promise=[obj];
                    if(product.type==params.product_types.course && product.early_birds_offer && product.early_birds_offer.length){
                        promise.push(service.totalEnrolled(product._id, [order_status.credit]))
                    }
                    let result=await Promise.all(promise);
                    obj=result[0];
                    if(result[1]){
                        product['totalEnrolled']=result[1];
                        service.applyEarlyBirdOffer(product);
                    }
                    product['rating'] = obj.rating;
                    product['reviews'] = obj.counts;
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
        return await Comment.find({ object_id, created_by, type }).lean();

    },
    getProductRating: async (product_id) => {
        let data = await Comment.find({ object_id: product_id, type: params.review_type.product_review }, { rating: 1 }).lean();
        if (data && data.length) {
            let sum = data.reduce((acc, curvalue) => acc + curvalue.rating, 0);
            return { rating: Math.ceil(sum / data.length), counts: data.length };
        }
        return { rating: 0, counts: 0 };
    },
    async getEnrolledProductIds(user_id){
        let product_ids=[];
        let enrolledProducts = await Order.find({ user_id: user_id, product_type: { $ne: 'bulk' }, $or: [{ order_status: 'Free' }, { order_status: 'Credit' }] }, { product_id: 1, validity: 1 }).sort({ _id: -1 }).lean();
        for (let index = 0; index < enrolledProducts.length; index++) {
            if (enrolledProducts[index].validity && enrolledProducts[index].validity > new Date()) {
                product_ids.push(enrolledProducts[index].product_id);
            } else if (!enrolledProducts[index].validity) {
                product_ids.push(enrolledProducts[index].product_id);
            }
        }
        return product_ids;
    },
    applyEarlyBirdOffer(product){
        for(let index=0;index<product.early_birds_offer.length;index++){
            if(product.totalEnrolled<=product.early_birds_offer[index].enrolled_limit){
                product['discountPrice']=product.strikeprice-product.early_birds_offer[index].price;
                product.price=product.early_birds_offer[index].price;
                product['discountPercent'] = Math.ceil((product.strikeprice - product.price) * 100 / product.strikeprice);
                break;
            }
        }
    }
}
module.exports = { productService: service, ProductService: ProductService };