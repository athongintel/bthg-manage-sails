"use strict";
const mongoose = require('mongoose');

const constants = {
};

const customerContactSchema = new mongoose.Schema({
    customerID: {type: mongoose.Schema.ObjectId, ref: 'Customer', required: true},
    title: {type: String},
    name: {type: String, required: true},
    lastName: {type: String},
    position: {type: String},
    phoneNumber: {type: String},
    email: {type: String},
    discount: {type: String},
});

module.exports = mongoose.model('CustomerContact', customerContactSchema, 'customerContact');
module.exports.constants = constants;
