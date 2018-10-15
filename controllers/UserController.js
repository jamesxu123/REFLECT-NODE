const Datastore = require('@google-cloud/datastore');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
let datastore = new Datastore();

let UserController = {};

UserController.createUser = function (username, name, role, email, application, password, verifytoken, lastChanged, confirmed, callback) {
    UserController.findByEmail(email, function (err, user) {
        if (err) {
            return callback(err);
        }
        else if (user.length > 0) {
            return callback({error: "The email specified is already associated with an account"});
        }
        else {
            UserController.findByUsername(username, function (err, user) {
                if (err) {
                    return callback(err, message);
                }
                else if (user.length > 0) {
                    return callback({error: "The username specified is already associated with an account"});
                }
                else {
                    const userKey = datastore.key('user');
                    const entity = {
                        key: userKey,
                        data: [
                            {
                                name: 'username',
                                value: username,
                            },
                            {
                                name: 'name',
                                value: name,
                            },
                            {
                                name: 'role',
                                value: role,
                            },
                            {
                                name: 'email',
                                value: email,
                            },
                            {
                                name: 'application',
                                value: application,
                            },
                            {
                                name: 'password',
                                value: password,
                                excludeFromIndexes: true,
                            },
                            {
                                name: 'verifytoken',
                                value: verifytoken,
                            },
                            {
                                name: 'lastChanged',
                                value: lastChanged,
                            },
                            {
                                name: 'confirmed',
                                value: confirmed,
                            },
                        ],
                    };

                    datastore
                        .save(entity)
                        .then(() => {
                            return callback(null, "Success");
                        })
                        .catch(err => {
                            return callback(err);
                        });
                }
            });
        }
    });

}

UserController.findByEmail = function (email, callback) {
    const query = datastore.createQuery('user').filter('email', email);

    datastore
        .runQuery(query)
        .then(results => {
            const user = results[0];
            return callback(null, user);
        })
        .catch(err => {
            return callback(err);
        });
}

UserController.findByUsername = function (username, callback) {
    const query = datastore.createQuery('user').filter('username', username);

    datastore
        .runQuery(query)
        .then(results => {
            const user = results[0];
            return callback(null, user);
        })
        .catch(err => {
            return callback(err);
        });
}

UserController.findByID = function (id, callback) {
    const query = datastore.createQuery('user').filter('__key__', datastore.key(['user', id]));

    datastore
        .runQuery(query)
        .then(results => {
            const user = results[0];
            return callback(null, user);
        })
        .catch(err => {
            return callback(err);
        });
}

UserController.findByToken = function (token, callback) {
    const query = datastore.createQuery('user').filter('verifytoken', token);

    datastore
        .runQuery(query)
        .then(results => {
            const user = results[0];
            return callback(null, user);
        })
        .catch(err => {
            return callback(err, null)
        })
}

UserController.updateUser = function (id, field, updatedContent, callback) {

}

UserController.loginWithPassword = function (email, password, callback) {
    const query = datastore.createQuery('user').filter('email', email);

    datastore
        .runQuery(query)
        .then(results => {
            let user = results[0];
            console.log("Line 133")
            console.log("Line 134" + user.password);
            if (user.length > 0) {
                user = user[0];
                //console.log(user);
                //console.log(user.password,password);
                argon2.verify(user.password, password).then(match => {
                    console.log("Line 140");
                    if (match) {
                        console.log("Line 142");
                        if (user.verifytoken === '' || true) {
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
                        } else {
                            return callback({error: "Please verify your account."});
                        }

                    } else {
                        return callback({error: "Please verify your account."});
                    }
                })
            }
            else {
                console.log(user);
                return callback({error: "The given email does not have an account associated with it."});
            }

        })
        .catch(err => {
            return callback(err);
        });
}

module.exports = UserController;