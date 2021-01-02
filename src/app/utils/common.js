let { QuizModel,Product,ProductQuestionMap,Document } = require('../models');
const redis=require('../../config/redisConnection');
const params=require('../../config/env/development_params.json');


let common={
    getQuizData:async(quiz_id, hardset)=>{
        return await new Promise((resolve, reject)=>{
            redis.get(params.dev_quiz+quiz_id.toString(),async (err, someData)=>{
              if(err || !someData || hardset){
                let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
                let instructorLookup = { from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor' };
                let questionLookup = { from: 'questions', localField: 'questionList', foreignField: '_id', as: 'questions' };
                let query = [
                  { $match: {_id:quiz_id} },
                  { $lookup: subjectLookup },
                  { $unwind: `$${subjectLookup.as}` },
                  { $lookup: instructorLookup },
                  { $unwind: `$${instructorLookup.as}` },
                  { $lookup: questionLookup},
                  { $project: { questionList: 0, isDeleted: 0, status:0,examType:0,subjectId:0,createdAt:0,updatedAt:0,__v:0 } }
                ];
                let data=(await QuizModel.aggregate(query))[0] || [];
                // for(let index=0;index<data.items.length; index++){
                  redis.set(params.dev_quiz+data._id.toString(), JSON.stringify(data), (err)=>{
                    redis.expire(params.dev_quiz_list_key, params.quiz_expiry);
                  })
                // }
                resolve(data);
              }else{
                return resolve(JSON.parse(someData));
              }
            })
          })
    },
    flushCache:async (keys=[])=>{
      return new Promise((resolve, reject)=>{
        redis.del(keys, (err)=>{
          if(err){
            reject(err)
          }
          resolve(true);
        })
      })
    },
    getProduct:async (product_id)=>{
      let cacheKey=`${params.product_key}${product_id.toString()}`;
      return new Promise((resolve,reject)=>{
        redis.get(cacheKey, async(err, result)=>{
          if(!err && result){
            resolve(JSON.parse(result));
          }else{
            let match={};
            match['_id']=product_id;
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
            ]);
            redis.set(cacheKey,JSON.stringify(data[0]), (err)=>{
              redis.expire(cacheKey,params.product_expiry);
            });
            resolve(data[0]);
          }
        })
      })
    },
    getProductMeta:async(product)=>{
      let data;
      switch(product.type){
        case "1":
           data=await Document.find({product_id:product._id, status:true}).lean();
          break;
        case "2":
          data=await ProductQuestionMap.find({product_id:product._id, status:true}).lean();
          data= await ProductQuestionMap.aggregate([
            {$match:{product_id:product._id, status:true}},
            {$project:{question_id:1}},
            {$lookup:{
                from:"questions",
                localField:"question_id",
                foreignField:"_id",
                as:"questionData"
            }},
            {$unwind:"$questionData"},
            {$project:{"questionData._id":1,"questionData.options":1,"questionData.correctOption":1,"questionData.subjectId":1,"questionData.question":1,"questionData.description":1,
            "questionData.moduleId":1,"questionData.type":1}}
          ])
          break;
      }
      return data;
    }
}
module.exports=common;