const _ = require('lodash');
const MONGOOSE = require('mongoose');
const { USER_ROLE } = require('../../utils/constants');
const { QuestionModel } = require('../../mongo-models');
const controller = {
  /** Function to create Question */
  createQuestion: async (request, response) => {
    request.body.createdBy = request.user._id;
    const question = new QuestionModel({
      ...request.body,
      owner: new MONGOOSE.Types.ObjectId('5f4b821f8da5bf75cbd1cfb2'),
    });
    const data = await question.save();
    response.status(200).json({
      success: true,
      message: 'Question added successfully',
      data,
    });
  },
  /** Function to Update Question */
  updateQuestion: async (request, response) => {
    // const exist = await QuestionModel.findById(request.params.id).lean();
    const data = await QuestionModel.updateOne(
      { _id: request.params.id },
      request.body,
      { upsert: true, new: true }
    );
    response.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data,
    });
  },
  /** Function to find Question */
  getQuestions: async (request, response) => {
    let match = {
      ...( request.query.subjectId
        ? {subjectId: MONGOOSE.Types.ObjectId(request.query.subjectId)}: {}),
      ...(request.query.moduleId
        ? {moduleId: MONGOOSE.Types.ObjectId(request.query.moduleId)}: {}),
      ...(request.query.examId
        ? {examId: MONGOOSE.Types.ObjectId(request.query.examId)}: {}),
      ...(request.query.topicId
        ? {topicId: MONGOOSE.Types.ObjectId(request.query.topicId)}: {}),
      ...(request.user.role.some((role) => role == USER_ROLE.ADMIN)
        ? {}
        : { createdBy: MONGOOSE.Types.ObjectId(request.user._id) }),
    };
    const itemPerPage = parseInt(request.query.limit || '0') || 10;
    const skip = parseInt(request.query.index || '0') * itemPerPage;
    // match = _.pickBy(match, (val) => ![undefined, null, ''].includes(val));
    let query = [{ $match: match }];
    if (request.query.unique) {
      query = query.concat(
        {
          $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: 'questionList',
            as: 'quiz',
          },
        },
        {
          $match: { $or: [{ quiz: [] }, { 'quiz._id': MONGOOSE.Types.ObjectId(request.query.quizId) }] },
        },
      );
    }
    query = query.concat({ $skip: skip }, { $limit: itemPerPage })
    const data = await QuestionModel.aggregate(query);
    response.status(200).json({
      success: true,
      message: 'Questions fetched successfully',
      data,
    });
  },
  getQuestionById: async (request, response) => {
    const data = await QuestionModel.findById(request.params.id, [
      '_id',
      'options',
      'correctOption',
      'subjectId',
      'question',
      'description',
      'moduleId',
      'topicId',
      'examId',
      'type',
    ]).lean();
    response.status(200).json({
      success: true,
      message: 'Question fetched successfully',
      data,
    });
  },
  deleteQuestion: async (request, response) => {
    await QuestionModel.deleteOne({ _id: request.params.id });
    response.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  },
};

module.exports = { questionController: controller };
