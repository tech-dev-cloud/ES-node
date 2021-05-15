let fs = require('fs');
let gm = require('gm').subClass({ imageMagick: true });
let path = require('path');
const vimeoClient = require('../../config/vimeo');
let { QuizModel, QuestionModel } = require('../mongo-models');
const redis = require('../../config/redisConnection');
const params = require('../../config/env/development_params.json');


let common = {
  getQuizData: async (quiz_id, hardset) => {
    return await new Promise((resolve, reject) => {
      redis.get(params.dev_quiz + quiz_id.toString(), async (err, someData) => {
        if (err || !someData || hardset) {
          let subjectLookup = { from: 'subjects', localField: 'subjectId', foreignField: '_id', as: 'subjectData' };
          let instructorLookup = { from: 'users', localField: 'instructor', foreignField: '_id', as: 'instructor' };
          let questionLookup = { from: 'questions', localField: 'questionList', foreignField: '_id', as: 'questions' };
          let query = [
            { $match: { _id: quiz_id } },
            { $lookup: subjectLookup },
            { $unwind: `$${subjectLookup.as}` },
            { $lookup: instructorLookup },
            { $unwind: `$${instructorLookup.as}` },
            { $lookup: questionLookup },
            { $project: { questionList: 0, isDeleted: 0, status: 0, examType: 0, subjectId: 0, createdAt: 0, updatedAt: 0, __v: 0 } }
          ];
          let data = (await QuizModel.aggregate(query))[0] || [];
          // for(let index=0;index<data.items.length; index++){
          redis.set(params.dev_quiz + data._id.toString(), JSON.stringify(data), (err) => {
            redis.expire(params.dev_quiz_list_key, params.quiz_expiry);
          })
          // }
          resolve(data);
        } else {
          return resolve(JSON.parse(someData));
        }
      })
    })
  },
  flushCache: async (keys = []) => {
    return new Promise((resolve, reject) => {
      redis.del(keys, (err) => {
        if (err) {
          reject(err)
        }
        resolve(true);
      })
    })
  },

  getQuestion: async (question_id) => {
    let cacheKey = `${params.quiz_question_key}${question_id.toString()}`;
    return new Promise((resolve, reject) => {
      redis.get(cacheKey, async (err, someData) => {
        if (err || !someData) {
          let question = await QuestionModel.findById(question_id).lean();
          redis.set(cacheKey, JSON.stringify(question), () => {
            redis.expire(cacheKey, params.quiz_question_expiry)
          })
          resolve(question);
        } else {
          resolve(JSON.parse(someData));
        }
      })
    })
  },
  createThumbnail: async () => {

  },
  profileThumbnail: async (name) => {
    let username = name.split(" ");
    let imgText = (username.length > 1) ? `${username[0][0]}${username[1][0]}` : `${username[0][0]}`;
    let bgColor = common.getRandomColor();
    return new Promise((resolve, reject) => {
      gm(100, 100, bgColor)
        .stroke(bgColor)
        // .drawCircle(10, 10, 20, 10)
        .font("Helvetica.ttf", 12)
        .drawText(30, 20, imgText)
        .write(path.resolve(process.cwd(), path.join("uploads", "test.jpg")), function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(true)
          }
        });
    })
  },
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
module.exports = common;