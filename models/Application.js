const mongoose = require('mongoose');
const fields = require('../models/data/ApplicationFields');

let Schema = mongoose.Schema;
let schema = new Schema(fields);

module.exports = mongoose.model('Applications', schema );