const async=require('async');
const _=require('lodash');
const {Product, ProductImage, ProductQuestionMap}=require('../../models');
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
        if(request.body.product_map_data){
            switch(request.body.type){
                case '1':
                    
                case '2':
                    let data=request.body.product_map_data.map(question_id=>({question_id,product_id:obj._id}));
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
    getProducts:async(request, response)=>{
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
    getAppProducts:async(request, response)=>{
        let condition={status:true};
        if(request.query.type){
            condition['type']=request.query.type;
        }
       let product_ids=await Product.find(condition,{_id:1}).sort({priority:-1});
       let products=[];
       for(let i=0;i<product_ids.length;i++){
           products[i]=await common.getProduct(product_ids[i]._id);
       }
       if(!request.query.type){
            products=_.groupBy(products,obj=>obj.type);
            products['quiz']=products['2'];
            delete products['2'];
       }
       response.status(200).json({
           success:true,
           message:"Products fetched successfully",
           data:products
       })
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