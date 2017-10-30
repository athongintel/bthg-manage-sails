"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productTypeSchema = new mongoose.Schema({

});

module.exports = mongoose.model('ProductType', productTypeSchema, 'productType');
module.exports.constants = constants;
