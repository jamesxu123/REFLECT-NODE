const express = require('express');
const jwt = require('jsonwebtoken');
const UserController = require('../controllers/UserController');
const util = require('util');

let router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'API'});
});

router.post('/viewAllApplications', function (req, res, next) {
    let responseJSON = {
        status: 200,
        content: null
    };
    jwt.verify(req.body.token, process.env.JWT_SECRET, function (err, decoded) {
        if (decoded.role < 2) {
            pool.query("SELECT * FROM applications", function (error, results, fields) {
                if (!error) {
                    responseJSON.content = results;
                } else {
                    responseJSON.status = 500;
                }
                res.send(responseJSON);
            })
        } else {
            responseJSON.status = 403;
            res.send(responseJSON);
        }
    })
});
router.post('/charge', function (req, res, next) {
    //console.log(req);
    let responseJSON = {
        status: 200,
        message: 'OK'
    };

    UserController.createPayment(req, function (err, message) {
        if (err) {
            responseJSON.status = 500;
            responseJSON.message = err;
        }
        else {
            responseJSON.message = message;
        }

        res.send(responseJSON);
    });

});
module.exports = router;
