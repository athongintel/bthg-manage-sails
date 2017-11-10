"use strict";
const mongoose = require('mongoose');

const constants = {

};

const systemVariableSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    value: {type: String},
});

module.exports = mongoose.model('SystemVariable', systemVariableSchema, 'systemVariable');
module.exports.constants = constants;
