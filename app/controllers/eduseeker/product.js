const async = require('async');
const _ = require('lodash');
const Mongoose = require('mongoose');
const { Product, ProductImage, ProductQuestionMap, Document, Order, VideoContent } = require('../../models');
const config = require('../../../config/config');
let params = require(`../../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../../config/redisConnection');
const { aws } = require('../../services/aws');
const common = require('../../utils/common');
const productService = require('../../services/product');
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
        let obj = new Product(product_payload);
        let product = await obj.save();
        // if (request.body.image) {
        //     let image = new ProductImage({ ...request.body.image, product_id: product._id });
        //     product['image'] = await image.save();
        // }
        let data;
        if (request.body.product_map_data) {
            switch (request.body.type) {
                case '1':
                    data = request.body.product_map_data.map(obj => ({ ...obj, user_id: request.user._id, product_id: product._id }));
                    await Document.insertMany(data);
                    break;
                case '2':
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
        let skip = (parseInt(request.query.skip || 1) - 1) * request.query.limit;
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
        }
        let data = await Product.aggregate([
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
            { $group: { _id: null, count: { $sum: 1 }, items: { $push: "$$ROOT" } } },
            { $addFields: { items: { $slice: ["$items", skip, limit] } } }
        ]);
        responseData = { ...data[0] };
        if (request.query.product_id) {
            productMetaData = await common.getProductMeta(data[0].items[0]);
            responseData = { ...responseData, productMetaData };
            if (data[0].items[0].type == 3) {
                responseData.items[0].sub_products_info = await Product.find({ _id: { $in: data[0].items[0].sub_products } }).lean();
            }
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
        console.log(request.body);
        await Product.updateOne({ _id: request.params.id }, request.body);
        if (request.body.image) {
            await ProductImage.update({ product_id: request.params.id }, { product_id: request.params.id, ...request.body.image }, { upsert: true });
        }
        switch (request.body.type) {
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
            let enrolledProducts = await Order.find({ user_id: request.user._id, product_type: { $ne: '3' }, $or: [{ order_status: 'Free' }, { order_status: 'Credit' }] }, { product_id: 1, validity: 1 }).sort({ _id: -1 }).lean();
            for (let index = 0; index < enrolledProducts.length; index++) {
                if (enrolledProducts[index].validity && enrolledProducts[index].validity > new Date()) {
                    product_ids.push(enrolledProducts[index].product_id);
                } else if (!enrolledProducts[index].validity) {
                    product_ids.push(enrolledProducts[index].product_id);
                }
            }
            product_ids = enrolledProducts.map(obj => obj.product_id);
        } else if (request.query.product_ids) {
            product_ids = request.query.product_ids.split(',').map(id => Mongoose.Types.ObjectId(id))
        } else if (request.query.payment_request_id) {
            product_ids = Order.findOne({ payment_request_id: request.query.payment_request_id }, { product_id: 1 }).lean();
        } else {
            let condition = { status: true, isPublish: true };
            if (request.query.type) {
                condition['type'] = request.query.type;
            }
            product_ids = await Product.find(condition, { _id: 1 }).sort({ priority: -1 }).lean();
            product_ids = product_ids.map(obj => obj._id);
        }
        for (let i = 0; i < product_ids.length; i++) {
            let currentProduct = await common.getProduct(product_ids[i]);
            if (currentProduct) {
                if (currentProduct && currentProduct.strikeprice) {
                    currentProduct['discountPercent'] = Math.ceil((currentProduct.strikeprice - currentProduct.price) * 100 / currentProduct.strikeprice);
                }
                currentProduct.image = currentProduct.image.map(prod_image => prod_image.image_path);
                if (currentProduct.type == params.product_types.bulk) {
                    currentProduct['sub_products'] = await Promise.all(currentProduct.sub_products.map(async (product_id) => {
                        let obj = await common.getProduct(product_id);
                        if (obj) {
                            obj.image = obj.image.map(prod_image => prod_image.image_path);
                            obj['discountPercent'] = Math.round((currentProduct.strikeprice - currentProduct.price) * 100 / currentProduct.strikeprice);
                        }
                        return obj;
                    }))
                } else if (currentProduct.type == params.product_types.notes && request.query.enrolled) {
                    let docs = await Document.find({ product_id: currentProduct._id, status: true }, { _id: 1, filename: 1, url: 1, size: 1, mime_type: 1 }).lean();
                    currentProduct['docs'] = docs;
                }
                if (request.user) {
                    currentProduct.isPurchased = !!(await Order.findOne({ product_id: product_ids[i], user_id: request.user._id, order_status: "Credit" }).lean());
                }
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
                }
                else if (key == params.product_types.bulk) {
                    item.id = 2;
                    item.title = "Bulk Package";
                    item.weburl = `bulk-${item.id}`;
                    data.push(item);
                } else if (key == params.product_types.course) {
                    item.id = 1;
                    item.title = "Latest Courses";
                    item.weburl = `course-${item.id}`;
                    data.push(item);
                }
            }
            data.sort((a, b) => a.id - b.id);
        } else {
            let item = {
                title: "",
                weburl: "",
                products: products
            }
            if (request.query.type == '1') {
                item.title = "PDF";
                item.weburl = `pdf-${item.id}`;
                data.push(item);
            } else if (request.query.type == '2') {
                item.title = "Quiz";
                item.weburl = `quiz-${item.id}`;
                data.push(item);
            } else if (request.query.type == '3') {
                item.title = "Bulk Package";
                item.weburl = `bulk-${item.id}`;
                data.push(item);
            }
        }
        response.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data
        })
    },
    getProductDetails: async (request, response) => {
        let product = await common.getProduct(request.params.product_id);
        product.image = product.image.map(prod_image => prod_image.image_path);
        if (product.similar_products && product.similar_products.length) {
            product.similar_products_info = await Promise.all(product.similar_products.map(async id => {
                obj = await common.getProduct(id);
                obj.image = obj.image.map(prod_image => prod_image.image_path);
                return obj;
            }))
        }
        if (product.type == params.product_types.course) {
            await productService.getCourseContent(product);
        }
        response.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: product
        })
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
            let products = await Product.find({ status: true }, { _id: 1 }).lean();
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