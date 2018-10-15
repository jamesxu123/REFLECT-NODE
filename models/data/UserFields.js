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
    }
};

var application = {
    whyUWannaCome: {
        type: String,
        maxlength: 1500,
        questionType: 'fullResponse',
        question: 'Why do you want to come to MasseyHacks V?',
        mandatory: true
    },

    name: {
        type: String,
        maxlength: 10,
        questionType: 'shortAnswer',
        question: 'First Name',
        mandatory: true
    },

    skillQuestion: {
        type: Boolean,
        questionType: 'boolean',
        question: 'Are bananas yellow?',
        mandatory: true
    },

    grade: {
        type: String,
        questionType: 'dropdown',
        question: 'What grade are you in?',
        enum: {
            values: '<=8 9 10 11 12'
        },
        mandatory: true
    },

    school: {
        type: String,
        questionType: 'schoolSearch',
        question: 'Please select your school:',
        maxlength: 100,
        mandatory: true
    },

    testradio: {
        type: String,
        questionType: 'multiradio',
        question: 'What is 1 + 1?',
        enum: {
            values: '1 2 4 5'
        },
        mandatory: true
    },
    testcheck: {
        type: [String],
        questionType: 'multicheck',
        question: 'What is 2 + 1?',
        enum: {
            values: '5 1 4 3'
        },
        mandatory: true
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

    // Only parts user can update
    application: application,
};

module.exports = schema;