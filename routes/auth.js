let express = require('express');
let argon2 = require('argon2');
let mysql = require('mysql');
let jwt = require('jsonwebtoken');
let util = require('util');
let uuidv1 = require('uuid/v1');
let sgMail = require('@sendgrid/mail');
let hb = require('handlebars');
let fs = require('fs');
let UserController = require('../controllers/UserController')

let router = express.Router();

UserController.createUser("test","Test User",0,"test@coderach.ca",-1,"123abc","urmom",0,true, function(err,message){
	if(err){
		console.log(err);
	}
	else{
		console.log(message);
	}
});

let pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
sgMail.setApiKey(process.env.SG_API);
UserController.findByEmail("davidhui@davesoftllc.com", function(err,user){
	if(err){
		console.log(err);
	}
	else{
		console.log(user);
	}
});
UserController.loginWithPassword("davidhui@davesoftllc.com","123abc", function(err,message){
	if(err){
		console.log(err);
	}
	else{
		console.log("done!")
		console.log(message);
	}
});


router.post('/login', function (req, res, next) {
	
    let username = req.body.username;
    let password = req.body.password;
    let queryString = util.format("SELECT * FROM users WHERE username='%s';", username);
    let responseJSON = {
        status: 200,
        token: null,
        message: 'OK'
    };
    pool.query(queryString, function (error, results, fields) {
        if (results.length === 0) {
            responseJSON["status"] = 500;
            responseJSON["message"] = "User Does Not Exist";
            res.send(responseJSON);
        } else {
            argon2.verify(results[0].password, password).then(match => {
                if (match) {
                    if (results[0].verifytoken === '') {
                        let tokenJSON = {
                            username: username,
                            id: parseInt(results[0].id),
                            role: 0,//results[0].role,
                            application: results[0].application,
                        };
                        let token = jwt.sign(tokenJSON, process.env.JWT_SECRET, {
                            expiresIn: 60 * 60
                        });
                        responseJSON.token = token;
                    } else {
                        responseJSON.status = 403;
                        responseJSON.message = "Verify Email First";
                    }

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
    let username = req.body.username;
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let verifyToken = uuidv1();
    let role = 2;
    let responseJSON = {
        status: 200,
        message: 'OK'
    };
    console.log(username, password);
    const dupeQuery = util.format("SELECT id FROM users WHERE email='%s' OR username='%s'", email, username);
    pool.query(dupeQuery, function (error, results, fields) {
        if (error) {
            responseJSON.status = 500;
            responseJSON.message = "MySQL Error";
        } else {

            argon2.hash(password, {
                type: argon2.argon2i
            }).then(hash => {
                const queryString = util.format("INSERT INTO users (username, name, password, email, role, verifytoken) VALUES ('%s', '%s', '%s', '%s', '%d', '%s');", username, name, hash, email, 2, verifyToken);
                pool.query(queryString, function (error, results, fields) {
                    if (error) {
                        responseJSON.status = 500;
                        responseJSON.message = "Internal Error";
                        console.log(error);
                        res.send(responseJSON);
                    } else {
                        if (results.length === 0) {
                            fs.readFile('./emailTemplates/emailVerifyTemplate.hbs', 'UTF-8', function (err, contents) {
                                if (err) {
                                    responseJSON.status = 500;
                                    responseJSON.message = "File I/O Error";
                                    res.send(responseJSON)
                                } else {
                                    let htmlContent = hb.compile(contents);
                                    let data = {
                                        verifyURL: util.format("https://register@%s/auth/verify/%s", process.env.DOMAIN, verifyToken)
                                    };
                                    const result = htmlContent(data);
                                    const msg = {
                                        to: email,
                                        from: util.format("register@%s", process.env.DOMAIN),
                                        subject: "Please Verify Your Email",
                                        text: "Your email client does not support HTML",
                                        html: result
                                    };
                                    sgMail.send(msg).then(() => console.log("SG Mail Sent"))
                                        .catch(error => console.log(error.toString()));
                                    res.send(responseJSON);
                                }
                            });
                        } else {
                            responseJSON.status = 403;
                            responseJSON.message = "User Exists!";
                            res.send(responseJSON);
                        }
                    }
                })
            }).catch(err => {
                res.sendStatus(500);
                console.log(err);
            });
        }
    });
});

router.get('/verify/:verifyToken', function (req, res, next) {
    let responseJSON = {
        status: 200,
        message: 'OK'
    };
    const verifyToken = req.params.verifyToken;
    const queryString = util.format("SELECT id FROM users WHERE verifytoken='%s'", verifyToken);
    pool.query(queryString, function (error, results, fields) {
        if (error) {
            responseJSON.status = 500;
            responseJSON.message = "Invalid Token";
            res.send(responseJSON);
        } else {
            if (results.length > 0) {
                const updateQueryString = util.format("UPDATE users set verifytoken='' WHERE verifytoken = '%s'", verifyToken);
                pool.query(updateQueryString, function (error, results, fields) {
                    if (error) {
                        responseJSON.status = 500;
                        responseJSON.message = "MySQL Error";
                        res.send(responseJSON);
                    } else {
                        res.send(responseJSON);
                    }
                })
            }
        }
    })
});

module.exports = router;