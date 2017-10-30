"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productSchema = new mongoose.Schema({
    typeID: {type: mongoose.Schema.ObjectId, ref: 'ProductType', required: true},
});

module.exports = mongoose.model('Product', productSchema, 'product');
module.exports.constants = constants;
