let { UnitModel } = require('../models');
const { MONGO_ERROR, ERROR_TYPE } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const responseHelper = require('../utils/responseHelper');
let service = {};

/** Function to create a subject */
service.createResource = async (payload) => {
  const exist = await UnitModel.findOne({ subjectId: payload.subjectId, name: payload.name }).lean();
  if (exist) {
    throw responseHelper.createErrorResponse(MESSAGES.UNIT.DUPLICATE, ERROR_TYPE.ALREADY_EXISTS);
  }
  const unit = new UnitModel(payload);
  return await unit.save();
};

/** Function to get All Subject */
service.findResource = async (payload) => {
  return await UnitModel.find({ isDeleted: false }).lean();
}

/** Function to get Subject By ID */
service.findResourceByID = async (payload) => {
  return await UnitModel.findById(payload.id).lean();
}

/** Function to update Subject */
service.updateResource = async (payload) => {
  return await UnitModel.findByIdAndUpdate(payload.id, payload).lean();
}

/**Function to delete Subject */
service.deleteResource = async (payload) => {
  if (!payload.hardDelete) {
    return await UnitModel.findOneAndDelete({ _id: payload.id }, { isDeleted: true }).lean();
  }
  return await UnitModel.deleteOne({ _id: payload.id });
}

module.exports = { unitService: service };