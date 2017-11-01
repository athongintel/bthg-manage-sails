"use strict";
const mongoose = require('mongoose');

const constants = {
    BRANCH_HEADQUARTER: 1,
    BRANCH_BRANCH: 2
};

const branchSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    type: {type: Number, default: constants.BRANCH_BRANCH},
    address: {type: String},
    phoneNumber: {type: String},
});

module.exports = mongoose.model('Branch', branchSchema, 'branch');
module.exports.constants = constants;
