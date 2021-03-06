const express = require('express');
const jwt = require('jsonwebtoken');
const UserController = require('../controllers/UserController');
const ApplicationController = require('../controllers/ApplicationController');
const util = require('util');

let router = express.Router();

function getRequester(token){
    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (Exception){
        decoded = {
            role: 3,
            id: -2,
            additionalRoles: []
        }
    }
    console.log(decoded);
    return decoded;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'API'});
});

router.post('/viewAllApplications', function (req, res, next) {
    let responseJSON = {
        status: 200,
        content: null
    };
    ApplicationController.getAllApplications(function(err,applications){
        if(err){
            responseJSON.status = 500;
            responseJSON.content = err;
        }
        else{
            responseJSON.content = applications;
        }
        res.send(responseJSON);
    }, getRequester(req.token));
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
router.post('/createApplication', function (req, res, next) {
    //console.log(req);
    let responseJSON = {
        status: 200,
        message: 'OK'
    };

    ApplicationController.createApplication(req.body.userID,req.body.application, function(err, message){
        if(err){
            responseJSON.status = 500;
            responseJSON.message = err;
        }
        else{
            responseJSON.message = message;
        }
        res.send(responseJSON);
    },getRequester(req.token))

});
router.post('/removeApplication', function (req, res, next) {
    //console.log(req);
    let responseJSON = {
        status: 200,
        message: 'OK'
    };

    ApplicationController.removeApplication(req.body.appID, function(err, message){
        if(err){
            responseJSON.status = 500;
            responseJSON.message = err;
        }
        else{
            responseJSON.message = message;
        }
        res.send(responseJSON);
    },getRequester(req.token))

});
router.post('/bulkSignup', function (req, res, next) {
    //console.log(req);
    let responseJSON = {
        status: 200,
        message: 'OK'
    };

    UserController.agentBulkSignup(req.body.applications, function(err, message){
        if(err){
            responseJSON.status = 500;
            responseJSON.message = err;
        }
        else{
            responseJSON.message = message;
        }
        res.send(responseJSON);
    },getRequester(req.token))

});
module.exports = router;
