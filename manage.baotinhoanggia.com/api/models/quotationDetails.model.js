"use strict";
const mongoose = require('mongoose');

const constants = {
};

const quotationDetailsSchema = new mongoose.Schema({
    quotationID: {type: mongoose.Schema.ObjectId, ref: 'Quotation', required: true},
    productID: {type: mongoose.Schema.ObjectId, ref: 'Product', required: true},
    quantity: {type: Number, required: true},
    price: {type: String, required: true}
});

module.exports = mongoose.model('QuotationDetails', quotationDetailsSchema, 'quotationDetails');
module.exports.constants = constants;
