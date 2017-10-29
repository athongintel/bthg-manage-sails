"use strict";
const mongoose = require('mongoose');

const constants = {
    //-- userClass
    NORMAL_USER: 0,
    NORMAL_ADMIN: 99,
    SUPER_ADMIN: 999,
    //-- accountStatus
    ACCOUNT_AVAIL: 0,
    ACCOUNT_LOCKED: 1,
};

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    userClass: {type: Array, default: [constants.NORMAL_USER]},
    accountStatus: {type: Number, required: true, default: constants.ACCOUNT_AVAIL},
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    forgetPasswordCode: {type: String},
    forgetPasswordCodeExpiration: {type: String},
});

module.exports = mongoose.model('User', userSchema, 'user');
module.exports.constants = constants;
