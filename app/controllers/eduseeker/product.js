const async = require('async');
const _ = require('lodash');
const Mongoose = require('mongoose');
const { Product: ProductModel, ProductImage, ProductQuestionMap, Document, Order, Comment } = require('../../mongo-models');
const config = require('../../../config/config');
let params = require(`../../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../../config/redisConnection');
const { aws } = require('../../services/aws');
const common = require('../../utils/common');
const { productService } = require('../../services');
let { Product } = require('../../models/shop');
let productController = {
    /**
     * Handler to create product 
     * @param {*} request 
     * @param {*} response 
     */
    createProduct: async (request, response) => {
        let product_type = request.body.type;
        let product_payload = { ...request.body, created_by: request.user._id };

        if (product_type == params.product_types.bulk) {
            product_payload['sub_products'] = request.body.product_map_data.map(product_id => Mongoose.Types.ObjectId(product_id));
        } else if (product_type == params.product_types.quiz) {
            product_payload.product_meta['totalQuestions'] = request.body.product_map_data.length;
        }

        // Save Product 
        let obj = new ProductModel(product_payload);
        let product = await obj.save();
        // if (request.body.image) {
        //     let image = new ProductImage({ ...request.body.image, product_id: product._id });
        //     product['image'] = await image.save();
        // }
        let data;
        if (request.body.product_map_data) {
            switch (request.body.type) {
                case params.product_types.notes:
                    data = request.body.product_map_data.map(obj => ({ ...obj, user_id: request.user._id, product_id: product._id }));
                    await Document.insertMany(data);
                    break;
                case params.product_types.quiz:
                    data = request.body.product_map_data.map(question_id => ({ question_id, product_id: product._id }));
                    await ProductQuestionMap.insertMany(data);
                    break;
            }
        }
        response.status(200).json({
            success: true,
            message: "Product created successfully",
            data: product
        })
    },
    mapProductQuiz: async (request, response) => {
        await ProductQuestionMap.insertMany(request.body.content);
        response.status(200).json({
            success: true,
            message: 'Product map successfully'
        })
    },
    getAdminProducts: async (request, response) => {
        let productMetaData;
        let responseData;
        let limit = request.query.limit || 10;
        let skip = (parseInt(request.query.skip || 1) - 1) * request.query.limit || 0;
        let match = {
            created_by: request.user._id
        };
        let prodcut_type = request.query.type;
        if (request.query.product_id) {
            match['_id'] = request.query.product_id;
        }
        if (prodcut_type) {
            match['type'] = prodcut_type;
        }
        if (request.query.searchString) {
            match['type'] = { $ne: '3' }
            match['$text'] = { $search: request.query.searchString };
        } try {

            let data = await ProductModel.aggregate([
                { $match: match },
                {
                    $lookup:
                    {
                        from: "product_images", let: { "id": "$_id" }, pipeline: [
                            { $match: { $expr: { $eq: ["$product_id", "$$id"] } } },
                            { $project: { image_path: 1 } }
                        ],
                        as: "image"
                    },
                },
                { $lookup: { from: "products", localField: "similar_products", foreignField: "_id", as: "similar_products_info" } },
                { $sort: { _id: -1 } },
                { $group: { _id: null, count: { $sum: 1 }, items: { $push: "$$ROOT" } } },
                { $addFields: { items: { $slice: ["$items", skip, limit] } } }
            ]);
            responseData = { ...data[0] };
            if (request.query.product_id) {
                productMetaData = await productService.getProductMeta(data[0].items[0]);
                responseData = { ...responseData, productMetaData };
                if (data[0].items[0].type == 3) {
                    responseData.items[0].sub_products_info = await ProductModel.find({ _id: { $in: data[0].items[0].sub_products } }).lean();
                }
            }
        } catch (err) {
            console.log(err);
        }
        response.status(200).json({
            success: true,
            message: "Product fethed successfull",
            data: responseData
        })
    },
    updateProductByID: async (request, response) => {
        if (request.body.type == 3) {
            request.body['sub_products'] = request.body.product_map_data.map(product_id => Mongoose.Types.ObjectId(product_id));
        }
        await ProductModel.updateOne({ _id: request.params.id }, request.body);
        if (request.body.image) {
            await ProductImage.update({ product_id: request.params.id }, { product_id: request.params.id, ...request.body.image }, { upsert: true });
        }
        switch (request.body.type) {
            case '1': //Document Update
                data = request.body.product_map_data.map(obj => ({ ...obj, user_id: request.user._id, product_id: request.params.id }));
                await Document.insertMany(data);
                break;
            case '2': //Quiz
                try {
                    await commonF.updateQuiz(request.body, request.params.id);
                } catch (err) {
                    console.log(err)
                }
                break;
            case '3': //Bulk
                try {
                    await commonF.updateQuiz(request.body, request.params.id);
                } catch (err) {
                    console.log(err)
                }
                break;

        }
        response.status(200).json({
            success: true,
            message: "Product updated successfully"
        })
    },
    // Get Products
    getProducts: async (request, response) => {
        let data = [];
        let product_ids = [];
        let products = [];
        if (request.query.enrolled) {
            let enrolledProducts = await Order.find({ user_id: request.user._id, product_type: { $ne: 'bulk' }, $or: [{ order_status: 'Free' }, { order_status: 'Credit' }] }, { product_id: 1, validity: 1 }).sort({ _id: -1 }).lean();
            for (let index = 0; index < enrolledProducts.length; index++) {
                if (enrolledProducts[index].validity && enrolledProducts[index].validity > new Date()) {
                    product_ids.push(enrolledProducts[index].product_id);
                } else if (!enrolledProducts[index].validity) {
                    product_ids.push(enrolledProducts[index].product_id);
                }
            }
            product_ids = enrolledProducts.map(obj => obj.product_id);
        } else {
            let condition = { status: true, isPublish: true };
            if (request.query.type) {
                condition['type'] = request.query.type;
            }
            product_ids = await ProductModel.find(condition, { _id: 1 }).sort({ priority: -1 }).lean();
            product_ids = product_ids.map(obj => obj._id);
        }
        for (let i = 0; i < product_ids.length; i++) {
            let currentProduct = await productService.getProduct(product_ids[i]);
            if (currentProduct) {
                // currentProduct.image = currentProduct.image.map(prod_image => prod_image.image_path);
                // if (currentProduct.type == params.product_types.bulk) {
                //     currentProduct['sub_products'] = await Promise.all(currentProduct.sub_products.map(async (product_id) => {
                //         let obj = await common.getProduct(product_id);
                //         if (obj) {
                //             obj.image = obj.image.map(prod_image => prod_image.image_path);
                //             obj['discountPercent'] = Math.round((currentProduct.strikeprice - currentProduct.price) * 100 / currentProduct.strikeprice);
                //         }
                //         return obj;
                //     }))
                // } else if (currentProduct.type == params.product_types.notes && request.query.enrolled) {
                //     let docs = await Document.find({ product_id: currentProduct._id, status: true }, { _id: 1, filename: 1, url: 1, size: 1, mime_type: 1 }).lean();
                //     currentProduct['docs'] = docs;
                // }
                // if (request.user) {
                //     currentProduct.isPurchased = !!(await Order.findOne({ product_id: product_ids[i], user_id: request.user._id, order_status: "Credit" }).lean());
                // }
                products.push(currentProduct);
            }
        }
        if (!request.query.type) {
            products = _.groupBy(products, obj => obj.type);
            for (let key in products) {
                let item = { title: "", weburl: "", products: products[key] }
                if (key == params.product_types.notes) {
                    item.id = 4;
                    item.title = "PDF/E-Books";
                    item.weburl = `pdf-${item.id}`;
                    data.push(item);
                } else if (key == params.product_types.quiz) {
                    item.id = 3;
                    item.title = "Quiz";
                    item.weburl = `quiz-${item.id}`;
                    data.push(item);
                } else if (key == params.product_types.bulk) {
                    item.id = 2;
                    item.title = "Bulk Package";
                    item.weburl = `bulk-${item.id}`;
                    data.push(item);
                } else if (key == params.product_types.course) {
                    item.id = 1;
                    item.title = "Courses";
                    item.weburl = `course-${item.id}`;
                    data.push(item);
                }
            }
            data.sort((a, b) => a.id - b.id);
        }
        response.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data
        })
    },
    getProductDetails: async (request, response) => {
        const product_id = request.params.product_id;
        let enrolled = request.query.enrolled == 'true';
        let responsePayload = {};
        try {
            let result = await Promise.all(
                [
                    productService.getProduct(request.params.product_id),
                    productService.isProductPurchased(product_id, request.user),
                    productService.totalEnrolled(product_id)
                ]);
            let product = new Product(result[0]);
            let obj = result[1];
            product['purchaseStatus'] = obj.purchased;
            // if (result[2] && (result[2] * 2) > 50) {


            product['totalEnrolled'] = result[2] * 2 || 0;
            // }
            if (product.type == params.product_types.bulk) {
                product['sub_products'] = await Promise.all(product.sub_products.map(async (product_id) => {
                    let obj = await productService.getProduct(product_id);
                    return obj;
                }))
            } else if (product.type == params.product_types.notes && request.query.enrolled) {
                let docs = await Document.find({ product_id: product._id, status: true }, { _id: 1, filename: 1, url: 1, size: 1, mime_type: 1 }).lean();
                product['docs'] = docs;
            }
            if (enrolled) {
                if (!product.purchaseStatus) {
                    let data = {};
                    response.status(400).json({
                        success: false,
                        message: 'You have not enroll for this course',
                        data
                    });
                    return;
                }
                await product.userRatingReview(request.user._id);
            }
            if (product.type == params.product_types.course) {
                responsePayload.contents = await product.videoContent(enrolled);
            }
            response.status(200).json({
                success: true,
                message: 'Product fetched successfully',
                data: { ...product, ...responsePayload }
            })
        } catch (err) {
            console.log(err)
        }
    },
    flushProductsCache: async (request, response) => {
        let ids;
        if (request.query.product_ids) {
            ids = request.query.product_ids.split(",");
        }
        let keys;
        if (ids && ids.length) {
            keys = ids.map(id => params.product_cache_key + id);
        } else {
            let products = await ProductModel.find({ status: true }, { _id: 1 }).lean();
            keys = products.map(obj => params.product_cache_key + obj._id.toString());
        }
        redis.del(keys, (err) => {
            if (!err) {
                response.status(200).json({
                    success: true,
                    message: "Successfully refresh"
                })
            }
        })
    },
    addReview: async (request, response) => {
        let review_type = request.body.type;
        let obj;
        try {
            if (review_type == 'product_review') {
                if (!request.body.rating) {
                    throw 'rating is required';
                }
                let data = await productService.isProductPurchased(request.body.object_id, request.user._id);
                if (data.purchased) {
                    obj = new Comment({ ...request.body, created_by: request.user._id });
                } else {
                    throw 'user does not purchase this product yet';
                }
            } else {
                obj = new Comment({ ...request.body, created_by: request.user._id });
            }
            let comment = (await obj.save()).toObject();
            comment.user = request.user;
            response.status(200).json({
                success: true,
                data: comment
            });
        } catch (err) {
            console.log(err)
            response.status(400).json({
                success: false,
                message: err
            })
        }
    },
    getReviews: async (request, response) => {
        let last_doc_id = request.query.last_doc_id;
        let limit = request.query.limit || 3;
        const object_id = request.query.object_id;
        const type = request.query.type;
        let comments = await productService.getComments(object_id, null, type, last_doc_id, limit);
        let subComments = [];
        if (type != params.review_type.product_review) {
            for (let index = 0; index < comments.length; index++) {
                let promise = productService.getComments(null, comments[index]._id, type, comments[index]._id, 999999);
                subComments[index] = promise;
            };
            let data = await Promise.all(subComments);
            for (let index = 0; index < data.length; index++) {
                if (data[index]) {
                    comments[index].commentData = data[index];
                    comments[index].commentCounts = data[index].length;
                }
            }
        }
        response.status(200).json({
            success: true,
            data: { comments }
        })
    }
}
let commonF = {
    updateQuiz: async (payload, product_id) => {
        return new Promise((resolve, reject) => {
            async.auto({
                updateImage: async () => {
                    if (payload.image) {
                        let obj = await ProductImage.findOne({ product_id }).lean();
                        if (obj && obj.Key) {
                            let params = {
                                Bucket: process.env.BUCKET_NAME,
                                Key: obj.key
                            }
                            aws.deleteFile(params);
                            await ProductImage.updateOne({ product_id }, payload.image);
                        } else {
                            let image = new ProductImage({ ...payload.image, product_id });
                            await image.save();
                        }
                    }
                    return;
                },
                updateQuizMap: async () => {
                    if (payload.removed_items && payload.removed_items.length) {
                        await ProductQuestionMap.deleteMany({ product_id, question_id: { $in: payload.removed_items } });
                    }
                    if (payload.new_items && payload.new_items.length) {
                        let data = payload.new_items.map(question_id => ({ question_id, product_id }))
                        await ProductQuestionMap.insertMany(data);
                    }
                    return;
                }
            }, function (err) {
                if (!err) {
                    resolve(true);
                } else {
                    reject(err)
                }
            })
        })
    },

}

module.exports = { productController }