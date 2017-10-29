"use strict";
const crypto = require('crypto');

module.exports = {
    
    encrypt: function (data, key) {
        let cipher = crypto.createCipher('aes-256-ctr', key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },
    
    decrypt: function (data, key) {
        let decipher = crypto.createCipher('aes-256-ctr', key);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },
    
    randomBytes: crypto.randomBytes
};
