const mongoose = require('mongoose');

let userSettings = {
    canSelfRegister: {
        type: Boolean,
        required: true,
        default: true
    },
    canSelfPasswordReset: {
        type: Boolean,
        required: true,
        default: true
    },
    authTokenValidLength: {
        type: Number,
        required: true,
        default: 86400
    },
    resetTokenValidLength : {
        type: Number,
        required: true,
        default: 3600
    },
    mustVerifyEmail: {
        type: Boolean,
        required: true,
        default: true
    },
    canUpdateSelf: {
        type: Boolean,
        required: true,
        default: true
    }
};

let applicationSettings = {
    applicationsEnabled: {
        type: Boolean,
        required: true,
        default: true
    },
    paymentRequired: {
        type: Boolean,
        required: true,
        default: false
    },
    paymentAmount: {
        type: Number,
        required: true,
        default: 0
    },
    releaseDecisionImmediately: {
        type: Boolean,
        required: true,
        default: false
    },
    waitlistEnabled: {
        type: Boolean,
        required: true,
        default: true
    }
};

let schema = {
    users: userSettings,
    applications: applicationSettings
};

module.exports = schema;