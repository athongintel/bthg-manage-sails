"use strict";
const mongoose = require('mongoose');

const constants = {
    //-- authMethod
    AUTH_USERNAME: 0,
    AUTH_GG: 1,
    AUTH_FB: 2
};

const authSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.ObjectId, ref: 'User' },
    authMethod: { type: Number, default: constants.AUTH_USERNAME},
    extra1: { type: String },
    extra2: { type: String },
    extra3: { type: String },
    extra4: { type: String }
});

module.exports = mongoose.model('Auth', authSchema, 'auth');
module.exports.constants = constants;
