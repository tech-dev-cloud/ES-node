const async=require('async');
const _=require('lodash');
const Mongoose = require('mongoose');
const {Product, ProductImage, ProductQuestionMap, Document, Order}=require('../../models');
const params=require('../../../config/env/development_params.json')
const redis=require('../../../config/redisConnection');
const {aws}=require('../../services/aws');
const common=require('../../utils/common');
let controller={
    createProduct:async(request,response)=>{
        let product=new Product(request.body);
        let obj=await product.save();
        if(request.body.image){
            let image=new ProductImage({...request.body.image, product_id:obj._id});
            obj['image']=await image.save();
        }
        let data;
        if(request.body.product_map_data){
            switch(request.body.type){
                case '1':
                    await Document.insertMany(request.body.product_map_data);
                    break;
                case '2':
                    data=request.body.product_map_data.map(question_id=>({question_id,product_id:obj._id}));
                    await ProductQuestionMap.insertMany(data);
                    break;
            }
        }
        response.status(200).json({
            success:true,
            message:"Product created successfully",
            data:obj
        })
    },
    mapProductQuiz:async(request,response)=>{
        await ProductQuestionMap.insertMany(request.body.content);
        response.status(200).json({
            success:true,
            message:'Product map successfully'
        })
    },
    getAdminProducts:async(request, response)=>{
        let match={};
        let prodcut_type=request.query.type;
        if(request.query.product_id){
            match['_id']=request.query.product_id;
        }
        if(prodcut_type){
            match['type']=prodcut_type;
        }
        let data=await Product.aggregate([
            {$match:match},
            {$lookup:{
                from:"product_images",
                let:{"id":"$_id"},
                pipeline:[
                    {$match:{$expr:{$eq:["$product_id","$$id"]}}},
                    {$project:{image_path:1}}
                ],
                as:"image"
            }},
            {$lookup:{
                from:"product_question_maps",
                let:{"id":"$_id"},
                pipeline:[
                    {$match:{$expr:{$eq:["$product_id","$$id"]}}},
                    {$project:{question_id:1}},
                    {$group:{_id:null,"ids":{$push:"$question_id"}}}
                ],
                as:"questions"
            }},
            {$unwind:{path:"$questions", preserveNullAndEmptyArrays:true}},
            {$group:{_id:null,count:{$sum:1},items:{$push:"$$ROOT"}}}
        ]);
        
        response.status(200).json({
            success:true,
            message:"Product fethed successfull",
            data:data[0]
        })
    },
    updateProductByID:async(request,response)=>{
        let obj=await Product.updateOne({_id:request.params.id},request.body);
        switch(request.body.type){
            case '2':
                try{
                    await commonF.updateQuiz(request.body, request.params.id);
                }catch(err){
                    console.log(err)
                }
        }
        response.status(200).json({
            success:true,
            message:"Product updated successfully"
        })
    },
    getProducts:async(request, response)=>{
        let data=[];
        let product_ids=[];
        let products=[];
        if(request.query.enrolled){
            let enrolledProducts=await Order.find({user_id:request.user._id,$or:[{order_status:'Free'},{order_status:'Credit'}]},{product_id:1}).lean();
            product_ids=enrolledProducts.map(obj=>obj.product_id);
        }else if(request.query.product_ids){
            product_ids=request.query.product_ids.split(',').map(id=>Mongoose.Types.ObjectId(id))
        }else{
            let condition={status:true};
            if(request.query.type){
                condition['type']=request.query.type;
            }
            product_ids=await Product.find(condition,{_id:1}).sort({priority:-1}).lean();
            product_ids=product_ids.map(obj=>obj._id);
        }
        for(let i=0;i<product_ids.length;i++){
            products[i]=await common.getProduct(product_ids[i]);
        }
        products=products.map(product=>{
            product['discountPercent']=Math.ceil((product.strikeprice-product.price)*100/product.strikeprice);
            product.image=product.image.map(obj=>obj.image_path);
            return product;
       })
       if(!request.query.type){
            products=_.groupBy(products,obj=>obj.type);
            for(let key in products){
                let item={ title:"",weburl:"",products:products[key]}
                if(key=='1'){
                    item.id=2;
                    item.title="PDF";
                    item.weburl='pdf-2';
                    data.push(item);
                }else if(key=='2'){
                    item.id=1;
                    item.title="Quiz";
                    item.weburl='quiz-1';
                    data.push(item);
                }
            }
            data.sort((a,b)=>a.id-b.id);
       }else{
        let item={
            title:"",
            weburl:"",
            products:products
        }
        if(request.query.type=='1'){
            item.title="PDF";
            item.weburl='pdf-1';
            data.push(item);
        }else if(request.query.type=='2'){
            item.title="Quiz";
            item.weburl='quiz-2';
            data.push(item);
        }
       }
       response.status(200).json({
           success:true,
           message:"Products fetched successfully",
           data
       })
    },
    flushProductsCache:async(request,response)=>{
        let ids;
        if(request.query.product_ids){
            ids=request.query.product_ids.split(",");
        }
        let keys;
        if(ids && ids.length){
            keys=ids.map(id=>params.product_key+id);
        }else{
            let products=await Product.find({status:true},{_id:1}).lean();
            keys=products.map(obj=>params.product_key+obj._id.toString());
        }
        redis.del(keys,(err)=>{
            if(!err){
                response.status(200).json({
                    success:true,
                    message:"Successfully refresh"
                })
            }
        })
    },
    getEnrolledProducts:async(request,response)=>{
        let enrolledProducts=await Order.find({user_id:request.user._id,$or:[{order_status:'Free'},{order_status:'Credit'}]},{productId:1}).lean();

    }
}
let commonF={
    updateQuiz:async(payload, product_id)=>{
        return new Promise((resolve, reject)=>{
            async.auto({
                updateImage:async()=>{
                    if(payload.image){
                        let obj=await ProductImage.findOne({product_id}).lean();
                        if(obj && obj.Key){
                            let params={
                                Bucket: process.env.BUCKET_NAME,
                                Key: obj.key
                            }
                            aws.deleteFile(params);
                            await ProductImage.updateOne({product_id}, payload.image);
                        }else{
                            let image=new ProductImage({...payload.image,product_id});
                            await image.save();
                        }
                    }
                    return;
                },
                updateQuizMap:async()=>{
                    if(payload.removed_items && payload.removed_items.length){
                        await ProductQuestionMap.deleteMany({product_id, question_id:{$in:payload.removed_items}});
                    }
                    if(payload.new_items && payload.new_items.length){
                        let data=payload.new_items.map(question_id=>({question_id,product_id}))
                        await ProductQuestionMap.insertMany(data);
                    }
                    return;
                }
            }, function(err, result){
                if(!err){
                    resolve(true);
                }else{
                    reject(err)
                }
            })
        })
    }
}

module.exports={productController:controller}