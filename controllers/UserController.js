const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../models/User');
const SettingsController = require('../controllers/SettingsController');

//Stripe will only be loaded if needed
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const msgDisabled = "This function has been disabled by your system administrator.";
const msgNotInit = "The system has not yet finished initializing. Please wait a moment and try again.";
const msgPrivTooLow = "You do not have sufficient privileges to perform this action.";

let UserController = {};

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


UserController.createUser = function (firstname, lastname, role, email, password, callback, requesterObj) {
    if(settings){
        console.log("I'm getting called!");

        if(settings.users.canSelfRegister || requesterObj.role <= settings.system.adminRole) {

            if(role === -9999){
                role = settings.system.regularUserRole;
            }

            User.getByEmail(email, function (err, user) {

                if (!err || user) {
                    return callback({message: "A user with the specified email already exists."});
                }
                else {
                    User.create({
                            email: email,
                            firstName: firstname,
                            lastName: lastname,
                            password: password,
                            role: role,
                            passwordLastUpdated: Date.now(),
                            lastUpdated: Date.now(),
                            'status.active': !settings.users.mustVerifyEmail

                        }, function (err, user) {
                            if (err || !user) {
                                console.log(err);
                                return callback(err);
                            }
                            else {
                                //user created!
                                let verifyToken;
                                if(settings.users.mustVerifyEmail){
                                    verifyToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
                                        expiresIn: settings.users.authTokenValidLength
                                    });
                                }
                                else{
                                    verifyToken = -999;
                                }

                                return callback(null, {verifyToken: verifyToken});
                            }
                        }
                    );
                }

            });
        }
        else{
            return callback({ error: msgDisabled})
        }

    }
    else {
        return callback({ error: msgNotInit})
    }
    

};

UserController.updateUser = function (id, dataPack, callback, requesterObj) {
    if(settings){
        if((settings.users.canUpdateSelf && requesterObj.id && requesterObj.id == id) || requesterObj.role <= settings.system.adminRole ){
            dataPack.lastUpdated = Date.now();
            User.findOneAndUpdate({_id: id}, {$set: dataPack}, {returnNewDocument: true}, function (err, user) {
                if (err) {
                    return callback(err);
                }
                else {
                    return callback(null, user);
                }
            });
        }
        else {
            if((requesterObj.id && requesterObj.id != id) || !requesterObj.id){
                return callback({error: msgPrivTooLow});
            }
            else{
                return callback({error: msgDisabled});
            }

        }
    }
    else{
        return callback({ error: msgNotInit})
    }
};

UserController.getPasswordResetToken = function (id, callback, requesterObj) {
    if(settings) {
        if(settings.users.canSelfPasswordReset || requesterObj.role <= settings.system.adminRole){
            let tokenJSON = {
                id: user._id,
                issued: Date.now()
            };
            let token = jwt.sign(tokenJSON, process.env.JWT_SECRET, {
                expiresIn: Date.now() + 86400
            });
            return callback(null, token);
        }
        else{
            return callback({ error: msgDisabled});
        }
        
    }
    else{
        return callback({ error: msgNotInit})
    }
};

UserController.resetPassword = function (token, password, callback, requesterObj) {
    if(settings){
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err || !decoded) {
                return callback(err);
            }
            else {
                User.findOne({_id: decoded.id}, {passwordLastUpdated: 1}, function (err, user) {
                    if (err) {
                        return callback(err);
                    }
                    else {
                        if (decoded.issued > user.passwordLastUpdated || decoded.exp <= Date.now()) {
                            // update password
                            argon2.hash(password, {
                                type: argon2.argon2i
                            }).then(hash => {
                                User.findOneAndUpdate({_id: decoded.id}, {
                                    $set: {
                                        password: hash,
                                        passwordLastUpdated: Date.now()
                                    }
                                }, function (err, user) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    else {
                                        return callback(null, {message: "Success"});
                                    }
                                });
                            }).catch(err => {
                                return callback(err);
                            });

                        }
                        else {
                            return callback({error: "The token has expired!"});
                        }
                    }
                })
            }
        });
        }
    else{
        return callback({error: msgNotInit})
    }

};

UserController.loginWithPassword = function (email, password, callback, requesterObj) {
    if(settings){
        User.findOne({
            email: email
        }, '+password', function (err, user) {
            if (err || !user) {
                return callback({error: "Email or password incorrect!"});
            }
            else {
                argon2.verify(user.password, password).then(match => {
                    if (match || requesterObj.role <= settings.system.adminRole) {
                        console.log("Login by:\n" + user);
                        if (user.status.active) {
                            let tokenJSON = {
                                email: email,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                id: user._id,
                                issued: Date.now(),
                                role: parseInt(user.role),
                                application: user.application
                            };
                            let token = jwt.sign(tokenJSON, process.env.JWT_SECRET, {
                                expiresIn: settings.users.authTokenValidLength
                            });
                            return callback(null, {token: token});
                        }
                        else {
                            return callback({error: "Please verify your account!"});
                        }
                    } else {
                        return callback({error: "Email or password incorrect!"});
                    }
                });
            }
        });
    }
    else{
        return callback({ error: msgNotInit})
    }

};

UserController.verifyUser = function (token, callback, requesterObj) {
    if(settings){
        if(!settings.users.mustVerifyEmail || requesterObj.role < settings.system.adminRole){
            jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
                if (err) {
                    return callback(err);
                }
                else {
                    if (decoded.id && decoded.exp >= Date.now()) {
                        User.findOneAndUpdate({_id: decoded.id}, {$set: {'status.active': true}}, function (err) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, {message: "Success"});
                        });
                    }
                    else {
                        return callback({error: "The given token is invalid or has expired."});
                    }
                }
            });
        }
        else {
            return callback({error: msgDisabled});
        }

    }
    else{
        return callback({ error: msgNotInit})
    }
};

UserController.createPayment = function (req, callback, requesterObj) {
    if(settings) {
        if(settings.applications.applicationsEnabled && settings.applications.paymentRequired && settings.applications.paymentAmount > 0){
            let amount = settings.applications.paymentAmount;
            User.getByEmail(req.body.stripeEmail, function (err, user) {
                if (err || !user) {
                    return callback(err);
                } else {
                    if (user.status.paymentStatus == 0) {
                        stripe.customers.create({
                            email: req.body.stripeEmail,
                            source: req.body.stripeToken
                        })
                            .then(customer =>
                                stripe.charges.create({
                                    amount,
                                    description: "Sample Charge",
                                    currency: "cad",
                                    customer: customer.id,
                                    metadata: {userID: user._id.toString()}
                                }))
                            .then(charge => {
                                console.log(charge);
                                User.findOneAndUpdate({email: req.body.stripeEmail}, {
                                    $set: {
                                        'status.paymentStatus': 1,
                                        chargeID: charge.id
                                    }
                                }, function (err, user) {
                                    if (err) {
                                        return callback(null, {chargeID: charge.id});
                                    }
                                    else {
                                        return callback(null, {message: "Success", chargeID: charge.id})
                                    }
                                });
                            })
                            .catch(err => {
                                // Deal with an error
                                console.log(err.message);
                                return callback({error: err}, {message: "Your card was not charged."});
                            });
                    }
                    else {
                        return callback({error: "You have already paid the fee or have filed a dispute. Your card has not been charged again."});
                    }

                }
            })
        }
        else{
            return callback({error: msgDisabled});
        }

    }
    else{
        return callback({ error: msgNotInit})
    }
};

module.exports = UserController;