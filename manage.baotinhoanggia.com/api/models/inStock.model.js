"use strict";
const mongoose = require('mongoose');

const constants = {
    STOCK_INIT_STOCK: 'STOCK_INIT_STOCK'
};

const inStockSchema = new mongoose.Schema({
    productID: {type: mongoose.Schema.ObjectId, ref: 'Product', required: true},
    branchID: {type: mongoose.Schema.ObjectId, ref: 'Branch', required: true},
    userID: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
    supplierID: {type: mongoose.Schema.ObjectId, ref: 'Supplier'},
    quantity: {type: Number, required: true},
    inStockOrderID: {type: mongoose.Schema.ObjectId, ref: 'InStockOrder'},
    price: {type: String},
    metaInfo: {type: mongoose.Schema.Types.Mixed},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('InStock', inStockSchema, 'inStock');
module.exports.constants = constants;
