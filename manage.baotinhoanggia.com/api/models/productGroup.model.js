"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productGroupSchema = new mongoose.Schema({

});

module.exports = mongoose.model('ProductGroup', productGroupSchema, 'productGroup');
module.exports.constants = constants;
