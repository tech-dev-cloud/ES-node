const { MONGO_ERROR } = require('../../utils/constants');
const { Topics } = require('../../mongo-models/topics');
const SubjectService = require('./subject-service');
const Mongoose = require('mongoose');
const subjectController = {
  /** Controller to create Subject */
  createSubject: async (request, response) => {
    const subjectService = new SubjectService();
    try {
      const data = await subjectService.createSubject(request.body);
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
    const subjectService = new SubjectService();
    const data = await subjectService.getAllSubjects(request.body);
    response.status(200).json({
      success: true,
      message: 'Subjects data fetched successfully',
      data,
    });
  },
  /** Controller to find Subject by id */
  getSubjectById: async (request, response) => {
    const match = { _id: Mongoose.Types.ObjectId(request.params.id) };
    const subjectService = new SubjectService();
    const data = await subjectService.getAllSubjects(match);
    response.status(200).json({
      success: true,
      message: 'Subject data fetched successfully',
      data: data[0],
    });
  },
  /** controller to update Subject by ID */
  updateSubject: async (request, response) => {
    const subjectId = request.params.id;
    const subjectService = new SubjectService();
    const data = await subjectService.updateSubject(subjectId, request.body);
    response.status(200).json({
      success: true,
      message: 'Subject data updated successfully',
      data,
    });
  },
  getExams: async (request, response) => {
    const data = await SubjectService.getExams();
    response.status(200).json({
      success: true,
      message: 'get all exams',
      data,
    });
  },

  createTopic: async (request, response) => {
    const data = await SubjectService.createTopic(
      request.body,
      request.user._id
    );
    response.status(200).json({
      success: true,
      message: 'Create topic',
      data,
    });
  },
  updateTopic: async (request, response) => {
    const data = await SubjectService.updateTopic(
      request.params.topicId,
      request.body
    );
    response.status(200).json({
      success: true,
      message: 'topic updated',
      data,
    });
  },
  deleteTopic: async (request, response) => {
    const data = await SubjectService.deleteTopic(request.params.topicId);
    response.status(200).json({
      success: true,
      message: 'Delete topic',
      data,
    });
  },
};

module.exports = { subjectController };
