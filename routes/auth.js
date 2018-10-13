let express = require('express');
let argon2 = require('argon2');
let mysql = require('mysql');
let jwt = require('jsonwebtoken');
let util = require('util');

let router = express.Router();

let pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.post('/login', function (req, res, next) {
    let user = req.body.username;
    let password = req.body.password;
    let queryString = util.format("SELECT * FROM users WHERE username='%s';", user);
    let responseJSON = {
        status: 200,
        token: null,
        message: 'OK'
    };
    pool.query(queryString, function (error, results, fields) {
        if (results.length == 0) {
            responseJSON["status"] = 500;
            responseJSON["message"] = "User Does Not Exist";
            res.send(responseJSON);
        } else {
            argon2.verify(results[0].password, password).then(match => {
                if (match) {
                    let tokenJSON = {
                        username: user,
                        id: parseInt(results[0].id),
                        role: results[0].role,
                        application: results[0].application,
                    };
                    let token = jwt.sign(tokenJSON, 'secret', {
                        expiresIn: 60 * 60
                    });
                    responseJSON.token = token;

                } else {
                    responseJSON.status = 403;
                    responseJSON.message = 'Invalid Credentials';
                }
                res.send(responseJSON);
            })
        }
    });
});

router.post('/signup', function (req, res, next) {
    let user = req.body.username;
    let password = req.body.password;
    console.log(user, password);
    argon2.hash(password, {
        type: argon2.argon2i
    }).then(hash => {
        res.send(hash)
    }).catch(err => {
        res.sendStatus(500);
        console.log(err);
    });
});

module.exports = router;