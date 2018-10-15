const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const util = require('util');

let router = express.Router();

let pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

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

module.exports = router;
