"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productGroupSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('ProductGroup', productGroupSchema, 'productGroup');
module.exports.constants = constants;
