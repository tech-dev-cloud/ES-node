const {USER_ROLE}=require('../../utils/constants');
const { QuestionModel } = require('../../mongo-models');
let controller = {
  /** Function to create Question */
  createQuestion: async (request, response) => {
    request.body.createdBy = request.user._id;
    const question = new QuestionModel(request.body);
    let data = await question.save();
    response.status(200).json({
      success: true,
      message: "Question added successfully",
      data
    })
  },
  /** Function to Update Question */
  updateQuestion: async (request, response) => {
    // const exist = await QuestionModel.findById(request.params.id).lean();
    let data = await QuestionModel.updateOne({ _id: request.params.id }, request.body,{upsert:true, new :true});
    response.status(200).json({
      success: true,
      message: "Question updated successfully",
      data
    })
  },
  /** Function to find Question */
  getQuestions: async (request, response) => {
    const match={subjectId: request.query.subjectId};
    if(!request.user.role.some(role=>role==USER_ROLE.ADMIN)){
      match['createdBy']=request.user._id;
    }
    let data = await QuestionModel.find(match, ["_id", "options", "correctOption", "subjectId", "question", "description", "moduleId", "type"]).lean();
    response.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      data
    })
  },
  getQuestionById: async (request, response) => {
    let data = await QuestionModel.findById(request.params.id, ["_id", "options", "correctOption", "subjectId", "question", "description", "moduleId", "type"]).lean();
    response.status(200).json({
      success: true,
      message: "Question fetched successfully",
      data
    })
  },
  deleteQuestion: async (request, response) => {
    await QuestionModel.deleteOne({ _id: request.params.id });
    response.status(200).json({
      success: true,
      message: "Question deleted successfully"
    })
  }

};

module.exports = { questionController: controller }