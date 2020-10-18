const {Module}=require('../../models');
let controller = {
    GetModuleList:async(payload)=>{
        return await Module.find({subjectId:payload.subjectId}).select(["name","_id"]).lean();
    }
};


module.exports = { moduleController: controller }