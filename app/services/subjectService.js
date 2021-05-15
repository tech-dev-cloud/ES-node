let { SubjectModel } = require('../mongo-models');
const { MONGO_ERROR, ERROR_TYPE } = require('../utils/constants');
const MESSAGES = require('../utils/messages');
const responseHelper = require('../utils/responseHelper');
let service = {};

/** Function to create a subject */
service.createResorce = async (payload) => {
  const subject = new SubjectModel(payload);
  try {
    return await subject.save();
  } catch (err) {
    if (err.code == MONGO_ERROR.DUPLICATE) {
      throw responseHelper.createErrorResponse(ERROR_TYPE.ALREADY_EXISTS, MESSAGES.SUBJECT.DUPLICATE);
    }
    throw err;
  }
};

/** Function to get All Subject */
service.findResource = async (payload) => {
  return await SubjectModel.find({ isDeleted: false }).lean();
}

/** Function to get Subject By ID */
service.findResourceByID = async (payload) => {
  return await SubjectModel.findById(payload.id).lean();
}

/** Function to update Subject */
service.updateResource = async (payload) => {
  try {
    return await SubjectModel.findByIdAndUpdate(payload.id, payload).lean;
  } catch (err) {
    if (err.code == MONGO_ERROR.DUPLICATE) {
      throw responseHelper.createErrorResponse(ERROR_TYPE.ALREADY_EXISTS, MESSAGES.SUBJECT.DUPLICATE);
    }
    throw err;
  }
}

/**Function to delete Subject */
service.deleteResource = async (payload) => {
  if (!payload.hardDelete) {
    return await SubjectModel.findOneAndDelete({ _id: payload.id }, { isDeleted: true }).lean();
  }
  return await SubjectModel.deleteOne({ _id: payload.id });
}

module.exports = { subjectService: service };