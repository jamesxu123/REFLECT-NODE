const Application = require('../models/Application');
const SettingsController = require('../controllers/SettingsController');
const User = require('../models/User');

ApplicationController = {};

const msgDisabled = "This function has been disabled by your system administrator.";
const msgNotInit = "The system has not yet finished initializing. Please wait a moment and try again.";
const msgPrivTooLow = "You do not have sufficient privileges to perform this action.";

let settings;

SettingsController.returnSettings(function(err,rSettings){
    console.log('urmom');
    if (err || !rSettings) {
        console.log("CRITICAL - UNABLE TO FETCH SETTINGS!");
        process.exit(1);
    }
    else {
        settings = rSettings;
        console.log('done');
        console.log(rSettings);
    }

});

ApplicationController.getAllApplications = function(callback, requesterObj){
    if(settings){
        console.log(settings);
        console.log(requesterObj)
        if((settings.applications.applicationsEnabled && settings.applications.usersCanViewOtherApplications) || requesterObj.role < 2){
            Application.find({},function(err,applications){
                if(err || !applications){
                    return callback(err);
                }
                else{
                    return callback(null,applications);
                }

            });
        }
        else{
            return callback({error: msgDisabled});
        }

    }
    else{
        return callback({error: msgNotInit});
    }

};

ApplicationController.createApplication = function(userid, applicationData, callback, requesterObj){
    if(settings){
        console.log(requesterObj);
        if((settings.applications.applicationsEnabled && settings.applications.applicationsOpen < Date.now() && settings.applications.applicationsClose > Date.now() && userid === requesterObj.id) || requesterObj.role <= settings.system.adminRole){

            User.findOne({_id:userid}, function(err, user){
                if(err || !user) {
                    return callback({error: "The user does not exist!"});
                }
                else if(user.application){
                    return callback({error: "The user already has an application!"});
                }
                else{
                    applicationData["userID"] = userid;
                    console.log("sfagsaffashghgahgdhdgha");
                    console.log(user);
                    console.log(applicationData);
                    Application.create(applicationData, function(err, application){
                        if(err){
                            return callback(err);
                        }
                        else{
                            console.log(application._id);
                            User.findByIdAndUpdate(userid, {$set: {application: application._id}}, { new: true }, function(err, user){
                                if(err){
                                    return callback(err);
                                }
                                else {
                                    return callback(null, user);
                                }
                            });

                        }
                    })
                }
            })


        }
        else{
            return callback({error: msgDisabled});
        }
    }
    else{
        return callback({error: msgNotInit})
    }

};

ApplicationController.removeApplication = function(appid, callback, requesterObj){
    if(settings){
        if((settings.applications.applicationsEnabled && userid === requesterObj.id) || requesterObj.role <= settings.system.adminRole){
            User.findOne({application: appid}, function(err, user){
                if(err){
                    return callback(err);
                }
                if(user){
                    User.findByIdAndUpdate(user._id, {$unset: {application: 1}}, function(err, user){
                        if(err){
                            return callback(err);
                        }
                        else{
                            Application.findOneAndDelete({_id: appid}, function(err, user){
                                if(err){
                                    return callback(err);
                                }
                                else{
                                    return callback(null, {message: "Success"});
                                }
                            });
                        }
                    });
                }
                else{
                    Application.findOneAndDelete({_id: appid}, function(err, user){
                        if(err){
                            return callback(err);
                        }
                        else{
                            return callback(null, {message: "Success"});
                        }
                    });
                }
            });
        }
        else{
            return callback({error: msgDisabled});
        }
    }
    else{
        return callback({error: msgNotInit})
    }

};

module.exports = ApplicationController;