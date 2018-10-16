const express = require('express');
const jwt = require('jsonwebtoken');
const util = require('util');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    let role = 2;
    let responseJSON = {
        status: 200,
        message: 'OK'
    };

    let amount = 999;

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
                metadata: {userid:1234}
            }))
        .then(charge => {
                console.log(charge);
                res.send(responseJSON);
        })
        .catch(err => {
            // Deal with an error
            console.log(err.message);
            res.send(responseJSON);
         });

});
module.exports = router;
