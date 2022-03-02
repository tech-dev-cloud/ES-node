const MONGOOSE = require('mongoose');
const CONSTANTS = require('../utils/constants');
const Schema = MONGOOSE.Schema;

let schema = new Schema({
  level: { type: String, required: true, enum:Object.values(CONSTANTS.DIFFICULT_LEVEL) },
})

schema.set('timestamps', true);
let DifficultLevel = MONGOOSE.model('difficult_level', schema);
module.exports = { DifficultLevel };