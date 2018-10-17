const mongoose = require('mongoose');
const fields = require('../models/data/SettingsFields');

let Schema = mongoose.Schema;
let schema = new Schema(fields);

module.exports = mongoose.model('Settings', schema );