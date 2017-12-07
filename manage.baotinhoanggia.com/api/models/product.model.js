"use strict";
const mongoose = require('mongoose');

const constants = {
};

const productSchema = new mongoose.Schema({
    typeID: {type: mongoose.Schema.ObjectId, ref: 'ProductType', required: true},
    brandID: {type: mongoose.Schema.ObjectId, ref: 'ProductBrand', required: true},
    model: {type: String, required: true},
    supplierIDs: [{type: mongoose.Schema.ObjectId, ref: 'Supplier'}],
    stockIDs: [{type: mongoose.Schema.ObjectId, ref: 'Branch'}],
    photos: [{type: mongoose.Schema.Types.Mixed}],
    description: {type: String},

    //-- stock info
    stockPeek: {type: Number, default: 0},
    price: {type: String}
    
});

module.exports = mongoose.model('Product', productSchema, 'product');
module.exports.constants = constants;
