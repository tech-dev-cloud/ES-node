const { SubjectModel, Module } = require('../../mongo-models');
const { subjectService } = require('../../services');
// const config = require('../../../config/config');
const { MONGO_ERROR } = require('../../utils/constants');
const { Topics } = require('../../mongo-models/topics');
const controller = {
  /** Controller to create Subject */
  createSubject: async (request, response) => {
    const subject = new SubjectModel({ name: request.body.name });
    const subjectModules = request.body.modules;
    try {
      const data = await subject.save().then((res) => {
        const modules = subjectModules.map((module) => ({
          subjectId: res._id,
          name: module.name,
        }));
        Module.insertMany(modules).then((moduleRes) => {
          for (let index = 0; index < subjectModules.length; index++) {
            const topics = subjectModules[index].topics.map((topic) => ({
              subjectId: res._id,
              moduleId: moduleRes[index],
              name: topic.name,
            }));
            Topics.insertMany(topics).then((res) => {});
          }
        });
      });
      response.status(200).json({
        success: true,
        message: 'Subject added successfully',
        data,
      });
    } catch (err) {
      if (err.code == MONGO_ERROR.DUPLICATE) {
        response.status(400).json({
          success: false,
          message: 'Subject already exist',
        });
      } else {
        response.status(500).json({
          success: false,
          message: 'Something went wrong',
        });
      }
    }
  },
  /** Controller to find Subjects */
  getAllSubjects: async (request, response) => {
    const data = await SubjectModel.aggregate([
      {
        $lookup: {
          from: 'modules',
          localField: '_id',
          foreignField: 'subjectId',
          as: 'modules',
        },
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'modules._id',
          foreignField: 'moduleId',
          as: 'topics',
        },
      },
    ]);
    response.status(200).json({
      success: true,
      message: 'Subjects data fetched successfully',
      data,
    });
  },
  /** Controller to find Subject by id */
  getSubjectById: async (request, response) => {
    const data = await SubjectModel.findById(request.params.id).lean();
    response.status(200).json({
      success: true,
      message: 'Subject data fetched successfully',
      data,
    });
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
      message: 'Subject data updated successfully',
      data,
    });
  },
};

module.exports = { subjectController: controller };
