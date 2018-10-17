const Settings = require('../models/Settings');

SettingsController = {};

SettingsController.returnSettings = function(callback){
    Settings.findOne({}, function(err, settings){
        if(err){
            return callback(err);
        }
        else{
            return callback(null,settings);
        }
    })
};

SettingsController.init = function(callback){
    Settings.create({}, function(err, message){
       if(err){
           return callback(err);
       }
       else{
           return callback(null, {message: "Success"})
       }
    });
};

module.exports = SettingsController;