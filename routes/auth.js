const express = require('express');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const util = require('util');
const sgMail = require('@sendgrid/mail');
const hb = require('handlebars');
const fs = require('fs');
const UserController = require('../controllers/UserController');
let router = express.Router();

sgMail.setApiKey(process.env.SG_API);

router.post('/login', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    // let queryString = util.format("SELECT * FROM users WHERE username='%s';", username);
    let responseJSON = {
        status: 200,
        token: null,
        message: 'OK'
    };
    UserController.loginWithPassword(email, password, function (error, token) {
        if (error) {
            responseJSON.message = error;
            responseJSON.status = 403;
        }
        responseJSON.token = token;
        res.send(responseJSON);
    });
});

router.post('/signup', function (req, res, next) {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;

    let role = 2;
    let responseJSON = {
        status: 200,
        message: 'OK'
    };
    argon2.hash(password, {
        type: argon2.argon2i
    }).then(hash => {
        UserController.createUser(firstname, lastname, role, email, hash, function (error, message) {
            if (error) {
                responseJSON.status = 500;
                responseJSON.message = error;
                res.send(responseJSON);
            } else {
                fs.readFile('./emailTemplates/emailVerifyTemplate.hbs', 'UTF-8', function (err, contents) {
                    if (err) {
                        responseJSON.status = 500;
                        responseJSON.message = err;
                    } else {
                        let htmlContent = hb.compile(contents);
                        let data = {
                            verifyURL: util.format("https://register.%s/auth/verify/%s", process.env.DOMAIN, message.verifyToken)
                        };
                        const result = htmlContent(data);
                        const msg = {
                            to: email,
                            from: util.format("register@%s", process.env.DOMAIN),
                            subject: "Please Verify Your Email",
                            text: "Your email client does not support HTML",
                            html: result
                        };
                        sgMail.send(msg).then(() => {
                            res.send(responseJSON);
                        }).catch(error => console.log(error))
                    }
                })
            }
        })
    }).catch(err => {
        return callback(err);
    });
});

router.get('/verify/:verifyToken', function (req, res, next) {
    let responseJSON = {
        status: 200,
        message: 'OK'
    };
    const verifyToken = req.params.verifyToken;
    UserController.verifyUser(verifyToken, function (err, user) {
        console.log("yoho!");
        if (err) {
            responseJSON.message = err;
            responseJSON.status = 500;
        } else {

        }

    });
    res.send(responseJSON);
});


module.exports = router;