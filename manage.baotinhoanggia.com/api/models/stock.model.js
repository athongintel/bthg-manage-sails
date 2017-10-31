"use strict";
const mongoose = require('mongoose');

const constants = {
};

const stockSchema = new mongoose.Schema({
    productID: {type: mongoose.Schema.ObjectId, ref: 'Product', required: true},
    quantity: {type: Number, required: true},
    metaInfo: {type: String},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Stock', stockSchema, 'stock');
module.exports.constants = constants;
