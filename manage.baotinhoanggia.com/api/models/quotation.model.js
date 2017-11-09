"use strict";
const mongoose = require('mongoose');

const constants = {
};

const quotationSchema = new mongoose.Schema({
    outStockOrderID: {type: mongoose.Schema.ObjectId, ref: 'OutStockOrder', required: true},
    userID: {type: mongoose.Schema.ObjectId, ref: 'User'},
    customerContactID: {type: mongoose.Schema.ObjectId, ref: 'User'},
    terms: {type: String},
    metaInfo: {type: mongoose.Schema.Types.Mixed},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Quotation', quotationSchema, 'quotation');
module.exports.constants = constants;
