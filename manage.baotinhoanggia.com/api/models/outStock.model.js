"use strict";
const mongoose = require('mongoose');

const constants = {
    STOCK_INIT_STOCK: 'STOCK_INIT_STOCK'
};

const outStockSchema = new mongoose.Schema({
    productID: {type: mongoose.Schema.ObjectId, ref: 'Product', required: true},
    branchID: {type: mongoose.Schema.ObjectId, ref: 'Branch', required: true},
    userID: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
    quantity: {type: Number, required: true},
    customerID: {type: mongoose.Schema.ObjectId, ref: 'Customer'},
    price: {type: String},
    outStockOrderID: {type: mongoose.Schema.ObjectId, ref: 'OutStockOrder'},
    metaInfo: {type: mongoose.Schema.Types.Mixed},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('OutStock', outStockSchema, 'outStock');
module.exports.constants = constants;
