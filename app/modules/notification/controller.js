const { MONGO_ERROR } = require('../../utils/constants');
const errorCodes = require('../../utils/errorCodes');
const responseHelper = require('../../utils/responseHelper');
const { successFullySubscribed } = require('../../utils/successCodes');
const service=require('./service');
module.exports = {
  stayTuned: async (request, response)=>{
    const data=request.body;
    try{
      await service.addNewSubscriber(data);
      response.status(200).json(responseHelper.success(successFullySubscribed))
    } catch(err){
      if(err.code==MONGO_ERROR.DUPLICATE) {
        response.status(400).json(responseHelper.error.BAD_REQUEST(errorCodes.ALREADY_SUBSCRIBED))
      }
    }
  }
};
