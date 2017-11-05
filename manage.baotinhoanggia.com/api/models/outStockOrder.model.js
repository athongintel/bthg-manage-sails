"use strict";
const mongoose = require('mongoose');

const constants = {
    ORDER_OPEN: 1,
    ORDER_CONFIRMED: 2,
    ORDER_PAYMENT_RECEIVED: 3,
    ORDER_FINISHED: 4,
    ORDER_CANCELED: 5,
};

const outStockOrderSchema = new mongoose.Schema({
    name: {type: String},
    customerID: {type: mongoose.Schema.ObjectId, ref: 'Customer'},
    branchID: {type: mongoose.Schema.ObjectId, ref: 'Branch', required: true},
    
    userID: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
    status: {type: Number, required: true, default: constants.ORDER_OPEN},
    metaInfo: {type: mongoose.Schema.Types.Mixed},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('OutStockOrder', outStockOrderSchema, 'outStockOrder');
module.exports.constants = constants;
