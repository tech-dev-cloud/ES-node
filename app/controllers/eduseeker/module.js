const {Module}=require('../../models');
let controller = {
    GetModuleList:async(request,response)=>{
        let data= await Module.find({subjectId:request.query.subjectId}).select(["name","_id"]).lean();
        response.status(200).json({
            success:true,
            message:"Modules fetched successfully",
            data
        })
    }
};


module.exports = { moduleController: controller }