let { SubjectModel } = require('../../mongo-models');
const { subjectService } = require('../../services');
const config = require('../../../config/config');
let controller = {
  /** Controller to create Subject */
  createSubject: async (request, response) => {
    const subject = new SubjectModel(request.body);
    try {
      let data = await subject.save();
      response.status(200).json({
        success: true,
        message: "Subject added successfully",
        data
      })
    } catch (err) {
      if (err.code == MONGO_ERROR.DUPLICATE) {
        response.status(400).json({
          success: false,
          message: "Subject already exist"
        })
      } else {
        response.status(500).json({
          success: false,
          message: "Something went wrong"
        })
      }
    }
  },
  /** Controller to find Subjects */
  getAllSubjects: async (request, response) => {
    let match = {};
    if (request.query.status) {
      match['status'] = request.query.status;
    }
    let data = await SubjectModel.find(match).lean();
    response.status(200).json({
      success: true,
      message: "Subjects data fetched successfully",
      data
    })
  },
  /** Controller to find Subject by id */
  getSubjectById: async (request, response) => {
    const data = await SubjectModel.findById(request.params.id).lean();
    response.status(200).json({
      success: true,
      message: "Subject data fetched successfully",
      data
    })
  },
  // /** Controller to delete Subject by id */
  // deleteSubject = async (payload) => {
  //   const data = await subjectService.deleteResource(payload);
  //   return responseHelper.createSuccessResponse(MESSAGES.SUBJECT.DELETE, { data });
  // }
  /** controller to update Subject by ID */
  updateSubject: async (request, response) => {
    const data = await subjectService.updateResource(request.body);
    response.status(200).json({
      success: true,
      message: "Subject data updated successfully",
      data
    })
  }

};






module.exports = { subjectController: controller }