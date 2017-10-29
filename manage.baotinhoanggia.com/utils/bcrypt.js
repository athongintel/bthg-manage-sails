"use strict";
const bcrypt = require('bcrypt-nodejs');

module.exports = {
    hash: function (inputPassword) {
        return new Promise(function (resolve, reject) {
            bcrypt.genSalt(10, (err, salt) => {
                if (err)
                    return reject(err);
                bcrypt.hash(inputPassword, salt, null, (err, hash) => {
                    if (err)
                        return reject(false);
                    return resolve(hash);
                });
            });
        });
    },
    
    compare: function (input, hash) {
        return new Promise(function (resolve, reject) {
            bcrypt.compare(input, hash, (err, result) => {
                if (err)
                    return reject(err);
                return resolve(result);
            });
        });
    },
};
