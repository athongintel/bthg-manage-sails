"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productTypeSchema = new mongoose.Schema({
    groupID: {type: mongoose.Schema.ObjectId, ref: 'ProductGroup', required: true},
    name: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('ProductType', productTypeSchema, 'productType');
module.exports.constants = constants;
