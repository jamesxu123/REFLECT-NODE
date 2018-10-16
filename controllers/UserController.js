const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../models/User');

let UserController = {};

UserController.createUser = function (firstname, lastname, role, email, password, callback) {
    console.log("I'm getting called!");

    User.getByEmail(email, function(err, user){

        if(!err || user){
            return callback({message:"A user with the specified email already exists."});
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

    });

};

UserController.updateUser = function (id, dataPack, callback) {
    dataPack.lastUpdated = Date.now();
    User.findOneAndUpdate({_id:id},{$set:dataPack}, { returnNewDocument:true }, function(err,user){
        if(err){
            return callback(err);
        }
        else{
            return callback(null,user);
        }
    })
};

UserController.getPasswordResetToken = function(id, callback){
    let tokenJSON = {
        id: user._id,
        issued: Date.now()
    };
    let token = jwt.sign(tokenJSON, process.env.JWT_SECRET, {
        expiresIn: Date.now() + 86400
    });
    return callback(null,token);
};

UserController.resetPassword = function(token, password, callback){
  jwt.verify(token, process.env.JWT_SECRET, function(err,decoded){
      if(err || !decoded){
          return callback(err);
      }
      else{
          User.findOne({_id: decoded.id}, {passwordLastUpdated:1}, function(err,user){
              if(err){
                  return callback(err);
              }
              else{
                  if(decoded.issued > user.passwordLastUpdated || decoded.exp <= Date.now()){
                      // update password
                      argon2.hash(password, {
                          type: argon2.argon2i
                      }).then(hash => {
                          User.findOneAndUpdate({_id: decoded.id}, {$set:{password:hash, passwordLastUpdated: Date.now()}}, function(err,user){
                              if(err){
                                  return callback(err);
                              }
                              else{
                                  return callback(null, {message: "Success"});
                              }
                          });
                      }).catch(err => {
                          return callback(err);
                      });

                  }
                  else{
                      return callback({error:"The token has expired!"});
                  }
              }
          })
      }
  });
};

UserController.loginWithPassword = function (email, password, callback) {
    User.findOne({
        email: email
    },'+password', function(err, user){
        if(err || !user){
            return callback({error:"Email or password incorrect!"});
        }
        else{
            argon2.verify(user.password,password).then(match =>{
               if(match){
                   console.log("Login by:\n"+user);
                   if(user.status.active){
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
                           expiresIn: Date.now() + 86400
                       });
                       return callback(null, {token: token});
                   }
                   else{
                       return callback({error:"Please verify your account!"});
                   }
               }else{
                   return callback({error:"Email or password incorrect!"});
               }
            });
        }
    });
};

UserController.verifyUser = function(token, callback){
    jwt.verify(token, process.env.JWT_SECRET, function(err,decoded){
        if(err){
            return callback(err);
        }
        else{
            if(decoded.id && decoded.exp >= Date.now()){
                User.findOneAndUpdate({_id:decoded.id},{$set:{'status.active':true}},function(err){
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