"use strict";
const mongoose = require('mongoose');

const constants = {
};

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    code: {type: String, required: true, unique: true},
    phoneNumber: {type: String},
    faxNumber: {type: String},
    address: {type: String},
    companyInfo: {type: mongoose.Schema.Types.Mixed},
});

module.exports = mongoose.model('Customer', customerSchema, 'customer');
module.exports.constants = constants;
