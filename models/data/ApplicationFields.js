const mongoose = require('mongoose');

/*
var schema = {
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
};*/

let schema = {
    userID: {
        type: mongoose.Schema.ObjectId
    },
    testString : {
        type: String
    }
};
module.exports = schema;