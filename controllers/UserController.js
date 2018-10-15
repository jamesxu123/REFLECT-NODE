const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../models/User');

let UserController = {};

UserController.createUser = function (username, firstname, lastname, role, email, password, callback) {
    console.log("I'm getting called!");

    User.getByEmail(email, function(err, user){

        if(!err || user){
            return callback({message:"A user with the specified email already exists."});
        }
        else{
            User.getByUsername(username, function(err, user){
                if(!err || user){
                    return callback({message:"A user with the specified username already exists."});
                }
                else{

                    User.create({
                            email: email,
                            firstName: firstname,
                            lastName: lastname,
                            password: password,
                            role: role,
                            passwordLastUpdated: Date.now(),
                            lastUpdated: Date.now()

                        }, function(err, user){
                            if (err || !user) {
                                console.log(err);
                                return callback(err);
                            }
                            else{
                                //user created!
                                let verifyToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
                                    expiresIn: Date.now() + 86400
                                });
                                return callback(null,{verifyToken:verifyToken});
                            }
                        }
                    );
                }
            })
        }

    });

};

UserController.updateUser = function (id, field, updatedContent, callback) {

};

UserController.loginWithPassword = function (email, password, callback) {

    /*
    const query = datastore.createQuery('user').filter('email', email);
    console.log("start!");
    datastore
        .runQuery(query)
        .then(results => {
            let user = results[0];
            console.log("Line 133");
            console.log("Line 134" + user.password);
            if (user.length > 0) {
                user = user[0];
                console.log(user);
                //console.log(user.password,password);
                argon2.verify(user.password, password).then(match => {
                    console.log("Line 140");
                    if (match) {
                        console.log("Line 142");
                        if (user.verifytoken === '' || !user.verifytoken) {
                            let tokenJSON = {
                                email: email,
                                id: parseInt(user[datastore.KEY].id),
                                role: user.role,//results[0].role,
                                application: user.application,
                            };
                            let token = jwt.sign(tokenJSON, process.env.JWT_SECRET, {
                                expiresIn: 60 * 60
                            });
                            return callback(null, {token: tokenJSON});
                            //return callback(null, {token: token});
                        } else {
                            return callback({error: "Please verify your account."});
                        }

                    } else {
                        return callback({error: "The username or password is incorrect."});
                    }
                })
            }
            else {
                console.log(user);
                return callback({error: "The username or password is incorrect."});
            }

        })
        .catch(err => {
            return callback(err);
        });*/
};

UserController.verifyUser = function(token, callback){
    console.log("herr");
    jwt.verify(token, process.env.JWT_SECRET, function(err,decoded){
        if(err){
            return callback(err);
        }
        else{
            console.log('sfgafsgsfgsf');
            console.log(decoded.id);
            console.log(decoded.exp <= Date.now());
            if(decoded.id && decoded.exp >= Date.now()){
                console.log("urmom");
                User.findOneAndUpdate({_id:decoded.id},{$set:{'status.active':true}},function(err){
                    console.log("sfgag");
                    if(err){
                        return callback(err);
                    }
                    return callback(null,{message:"Success"});
                });
            }
            else{
                return callback({error: "The given token is invalid or has expired."});
            }
        }
    });
};

module.exports = UserController;