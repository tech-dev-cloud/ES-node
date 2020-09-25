let { QuizModel } = require('../models');
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
                // let skip = (payload.index || DEFAULT.INDEX) * (payload.limit || DEFAULT.LIMIT);
                
                // if(payload.user.role==USER_ROLE.TEACHER){
                //   match.instructor=payload.user.userId
                // }
                let query = [
                  { $match: {_id:quiz_id} },
                  { $lookup: subjectLookup },
                  { $unwind: `$${subjectLookup.as}` },
                  // { $lookup: examTypeLookup },
                  { $lookup: instructorLookup },
                  { $unwind: `$${instructorLookup.as}` },
                  { $lookup: questionLookup},
                  { $project: { questionList: 0, isDeleted: 0, status:0,examType:0,subjectId:0,difficultLevel:0,createdAt:0,updatedAt:0,__v:0 } },
                //   { $group: { _id: null, items: { $push: '$$ROOT' } } },
                //   { $addFields: { items: { $slice: ['$items', skip, payload.limit || DEFAULT.LIMIT] } } }
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
    }
}
module.exports=common;