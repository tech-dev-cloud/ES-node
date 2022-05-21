const _ = require('lodash');
const mongoose = require('mongoose');
const {
  Module,
  SubjectModel,
  Topics,
  ExamModel,
} = require('../../mongo-models');
module.exports = class SubjectService {
  constructor() {}

  async createSubject(subjectPayload) {
    const subject = new SubjectModel({ name: subjectPayload.name });
    const data = await subject.save().then((res) => {
      const modules = subjectPayload.modules.map((module) => ({
        subjectId: res._id,
        name: module.name,
      }));
      const subjectModules = subjectPayload.modules;
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
    return data;
  }

  async getAllSubjects($match = {}) {
    const data = await SubjectModel.aggregate([
      { $match },
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
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          'modules._id': 1,
          'modules.name': 1,
          'modules.subjectId': 1,
          'topics._id': 1,
          'topics.name': 1,
          'topics.moduleId': 1,
          'topics.subjectId': 1,
        },
      },
    ]);
    this.formatSubjectData(data);
    return data;
  }
  updateSubject(subjectId, subject) {
    SubjectModel.updateOne(
      { _id: subjectId },
      { $set: { name: subject.name, status: subject.status } }
    );
    for (const module of subject.modules) {
      if (!module._id) {
        const obj = new Module({ name: module.name, subjectId });
        obj.save().then((res) => {
          const topics = module.topics.map((topic) => ({
            subjectId,
            moduleId: res._id,
            name: topic.name,
          }));
          Topics.insertMany(topics).then((res) => {});
        });
      } else {
        Module.updateOne({ _id: module._id }, { $set: { name: module.name } });
        if (module.topics) {
          const newTopics = module.topics
            .filter((topic) => !topic._id)
            .map((topic) => ({
              subjectId,
              moduleId: module._id,
              name: topic.name,
            }));
          Topics.insertMany(newTopics).then((res) => {});
        }
      }
    }
  }
  formatSubjectData(subjects) {
    for (const subject of subjects) {
      const groupedTopics = _.groupBy(subject.topics, 'moduleId');
      subject.modules = subject.modules.map((module) => {
        module.topics = groupedTopics[module._id];
        return module;
      });
    }
  }
  static getExams() {
    return ExamModel.find({ status: true }).lean();
  }
  static async createTopic(dataToSave, userId) {
    const obj = new Topics({
      ...dataToSave,
      createdBy: userId,
      updatedBy: userId,
    });
    return obj.save();
  }
  static async deleteTopic(topicId) {
    return Topics.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(topicId) },
      { isDeleted: true }
    );
  }
  static async updateTopic(topicId, dataToUpdate) {
    return Topics.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(topicId) },
      dataToUpdate,
      { new: true }
    );
  }
};
