const {TermsModel}=require('../../models');
const responseHelper = require('../../utils/responseHelper');
const MESSAGES = require('../../utils/messages');

let controller={
    createTerm: async(payload)=>{
        let obj=new TermsModel(payload);
        await obj.save();
        return true;
    },
    getTerms: async(payload)=>{
        let match={};
        if(payload.parent_id){
            match['parent_id']=payload.parent_id;
        }
        return await TermsModel.find(match).sort({_id:1}).skip(payload.index*20).limit(20);
    },
}
module.exports={termController:controller}