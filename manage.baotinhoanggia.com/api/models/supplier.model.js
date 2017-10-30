"use strict";
const mongoose = require('mongoose');

const constants = {
};

const supplierSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    address: {type: String},
    phoneNumber: {type: String},
    website: {type: String},
    iban: {type: String},
    bank: {type: String},
    bankAddress: {type: String},
    swift: {type: String},
});

module.exports = mongoose.model('Supplier', supplierSchema, 'supplier');
module.exports.constants = constants;
