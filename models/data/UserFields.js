const mongoose = require('mongoose');
const validator = require('validator');

const ADMIN = 0;
const STAFF = 1;
const PARTICIPANT = 2;

let status = {
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    submittedApplication: {
        type: Boolean,
        required: true,
        default: false
    },
    paymentStatus: {
        type: Number,
        required: true,
        default: 0
    },
    waitlisted: {
        type: Boolean,
        required: true,
        default: false,
    },
    admitted: {
        type: Boolean,
        required: true,
        default: false,
        condition: 'status.statusReleased'
    },
    admittedBy: {
        type: String
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    waiver: {
        type: Boolean,
        required: true,
        default: false
    },
    declined: {
        type: Boolean,
        required: true,
        default: false
    },
    rejected: {
        type: Boolean,
        required: true,
        default: false,
        condition: 'status.statusReleased'
    },
    checkedIn: {
        type: Boolean,
        required: true,
        default: false
    },
    checkInTime: {
        type: Number
    },
    confirmBy: {
        type: Number
    },
    statusReleased: {
        type: Boolean,
        default: false
    },
    additionalRoles: {
        type: [String]
    }
};

var schema = {

    firstName: {
        type: String,
        required: true,
        maxlength: 100
    },

    lastName: {
        type: String,
        required: true,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        maxlength: 100,
        validate: [
            validator.isEmail,
            'Invalid Email'
        ]
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    lastUpdated: {
        type: Number,
        required: true,
        default: 0
    },

    passwordLastUpdated: {
        type: Number,
        required: true,
        default: 0
    },

    chargeID: {
        type: String,
        required: false
    },

    role: {
        type: Number,
        required: true,
        default: 2
    },

    teamCode: {
        type: String,
        min: 0,
        maxlength: 140
    },

    status: status,

    agent: {
        type: mongoose.Schema.ObjectId
    },

    // Only parts user can update
    application: {
        type: mongoose.Schema.ObjectId
    }
};

module.exports = schema;