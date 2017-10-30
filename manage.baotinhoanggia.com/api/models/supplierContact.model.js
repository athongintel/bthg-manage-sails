"use strict";
const mongoose = require('mongoose');

const constants = {
};

const supplierContactSchema = new mongoose.Schema({
    supplierID: {type: mongoose.Schema.ObjectId, ref: 'Supplier', required: true},
    name: {type: String, required: true},
    position: {type: String},
    phoneNumber: {type: String},
    email: {type: String},
});

module.exports = mongoose.model('SupplierContact', supplierContactSchema, 'supplierContact');
module.exports.constants = constants;
