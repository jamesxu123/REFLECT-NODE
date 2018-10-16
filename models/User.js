const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fields = require('../models/data/UserFields');

//Define a schema
let Schema = mongoose.Schema;

let schema = new Schema(fields);

schema.statics.getByID = function(id, callback) {
    this.findOne({
        _id:  id
    }, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {
                error: 'User not found.'
            })

        }

        return callback(null, user);
    });
};

schema.statics.getByEmail = function (email, callback) {
    this.findOne({
        email:  email ? email.toLowerCase() : email
    }, function(err, user) {
        if (err || !user) {
            return callback(err ? err : {
                error: 'User not found'
            })
        }
        return callback(null, user);
    });
};

schema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName + ' ' + this.lastName;
    }

    return '';
});

//Export function to create "SomeModel" model class
module.exports = mongoose.model('User', schema );