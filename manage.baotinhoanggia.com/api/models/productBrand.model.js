"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productBrandSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    origin: {type: String, required: true}
});

module.exports = mongoose.model('ProductBrand', productBrandSchema, 'productBrand');
module.exports.constants = constants;
