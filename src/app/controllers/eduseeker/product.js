const async = require('async');
const _ = require('lodash');
const Mongoose = require('mongoose');
const { Product, ProductImage, ProductQuestionMap, Document, Order } = require('../../models');
const config = require('../../../config/config');
let params=require(`../../../config/env/${config.NODE_ENV}_params.json`);
const redis = require('../../../config/redisConnection');
const { aws } = require('../../services/aws');
const common = require('../../utils/common');
let controller = {
    createProduct: async (request, response) => {
        let product_payload={...request.body, created_by: request.user._id};
        if(request.body.type=='3'){
            product_payload['sub_products'] = request.body.product_map_data.map(product_id => Mongoose.Types.ObjectId(product_id));
        }else if(request.body.type=='2'){
            product_payload.product_meta['totalQuestions']=request.body.product_map_data.length;
        }
        let obj = new Product(product_payload);
        let product = await obj.save();
        if (request.body.image) {
            let image = new ProductImage({ ...request.body.image, product_id: product._id });
            product['image'] = await image.save();
        }
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
        if(request.query.searchString){
            match['$text']={$search:request.query.searchString};
        }
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
            { $group: { _id: null, count: { $sum: 1 }, items: { $push: "$$ROOT" } } }
        ]);
        responseData = { ...data[0] }
        if (request.query.product_id) {
            productMetaData = await common.getProductMeta(data[0].items[0]);
            responseData = { ...responseData, productMetaData };
        }
        response.status(200).json({
            success: true,
            message: "Product fethed successfull",
            data: responseData
        })
    },
    updateProductByID: async (request, response) => {
        await Product.updateOne({ _id: request.params.id }, request.body);
        switch (request.body.type) {
            case '2': //Quiz
                try {
                    await commonF.updateQuiz(request.body, request.params.id);
                } catch (err) {
                    console.log(err)
                }
        }
        response.status(200).json({
            success: true,
            message: "Product updated successfully"
        })
    },
    getProducts: async (request, response) => {
        let data = [];
        let product_ids = [];
        let products = [];

        if (request.query.enrolled) {
            let enrolledProducts = await Order.find({ user_id: request.user._id, product_type:{$ne:'3'}, $or: [{ order_status: 'Free' }, { order_status: 'Credit' }]}, { product_id: 1, validity:1 }).lean();
            for(let index=0;index<enrolledProducts.length;index++){
                if(enrolledProducts[index].validity && enrolledProducts[index].validity>new Date()){
                    product_ids.push(enrolledProducts[index].product_id);
                }else if(!enrolledProducts[index].validity){
                    product_ids.push(enrolledProducts[index].product_id);
                }
            }
            product_ids = enrolledProducts.map(obj => obj.product_id);
        } else if (request.query.product_ids) {
            product_ids = request.query.product_ids.split(',').map(id => Mongoose.Types.ObjectId(id))
        } else {
            let condition = { status: true };
            if (request.query.type) {
                condition['type'] = request.query.type;
            }
            product_ids = await Product.find(condition, { _id: 1 }).sort({ priority: -1 }).lean();
            product_ids = product_ids.map(obj => obj._id);
        }
        for (let i = 0; i < product_ids.length; i++) {
            let currentProduct=await common.getProduct(product_ids[i]);
            if(currentProduct && currentProduct.strikeprice){
                currentProduct['discountPercent'] = Math.ceil((currentProduct.strikeprice - currentProduct.price) * 100 / currentProduct.strikeprice);
            }
            currentProduct.image=currentProduct.image.map(prod_image => prod_image.image_path);
            if(currentProduct.type==3){
                currentProduct['sub_products']=await Promise.all(currentProduct.sub_products.map(async(product_id)=>{
                    let obj=await common.getProduct(product_id);
                    if(obj){
                        obj.image=obj.image.map(prod_image => prod_image.image_path);
                        obj['discountPercent'] = Math.ceil((currentProduct.strikeprice - currentProduct.price) * 100 / currentProduct.strikeprice);
                    }
                    return obj;
                }))
            }else if(currentProduct.type==1 && request.query.enrolled){
                let docs=await Document.find({product_id:currentProduct._id, status:true},{_id:1,filename:1,url:1,size:1, mime_type:1}).lean();
                currentProduct['docs']=docs;
            }
            products.push(currentProduct);
        }
        if (!request.query.type) {
            products = _.groupBy(products, obj => obj.type);
            for (let key in products) {
                let item = { title: "", weburl: "", products: products[key] }
                if (key == '1') {
                    item.id = 3;
                    item.title = "PDF";
                    item.weburl = `pdf-${item.id}`;
                    data.push(item);
                } else if (key == '2') {
                    item.id = 2;
                    item.title = "Quiz";
                    item.weburl = `quiz-${item.id}`;
                    data.push(item);
                }
                else if (key == '3') {
                    item.id = 1;
                    item.title = "Bulk Package";
                    item.weburl = `bulk-${item.id}`;
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
    },
    // getEnrolledProducts: async (request, response) => {
    //     let enrolledProducts = await Order.find({ user_id: request.user._id, $or: [{ order_status: 'Free' }, { order_status: 'Credit' }] }, { productId: 1 }).lean();

    // }
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

module.exports = { productController: controller }