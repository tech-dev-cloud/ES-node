const async=require('async');
let CONSTANTS=require('../utils/constants');
const WINSTON=require('../../config/winston')
const MODEL=require('../models');


module.exports=(mainCB)=>{
    return new Promise((resolve, reject)=>{
        async.auto({
            difficultLevel:function(callback){
                MODEL.DifficultLevel.deleteMany({}).then(res=>{
                    let payload=Object.values(CONSTANTS.DIFFICULT_LEVEL).map(val=>({level:val}));
                    WINSTON.info('DifficultLevel removed!')
                    MODEL.DifficultLevel.insertMany(payload).then(()=>{
                        WINSTON.info('DifficultLevel migrated!');
                        callback(null,true);
                    }).catch(err=>{
                    WINSTON.error('Unable to insert difficutLevel ', err);
                    callback(err,false);
                    })
                }).catch(err=>{
                    WINSTON.error('Unable to remove difficutLevel ', err);
                    callback(err,false);
                })
            },
            subjects:function (callback){
                MODEL.SubjectModel.deleteMany({}).then(()=>{
                    let payload=CONSTANTS.SUBJECT.map(val=>({name:val, status:true, isDeleted:false}));
                    MODEL.SubjectModel.insertMany(payload).then(()=>{
                        WINSTON.info('Subjects migrated!');
                        callback(null,true);
                    }).catch(err=>{
                        WINSTON.error('Unable to insert subjects ', err);
                        callback(err,false);
                    })
                }).catch(err=>{
                    WINSTON.error('Unable to remove subjects ', err);
                    callback(err,false);
                })
            }
        }, (err, result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })

    })
}