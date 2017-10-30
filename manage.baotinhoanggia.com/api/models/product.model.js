"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productSchema = new mongoose.Schema({

});

module.exports = mongoose.model('Product', productSchema, 'product');
module.exports.constants = constants;
