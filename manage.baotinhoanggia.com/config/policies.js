const jwt = require('jsonwebtoken');
const sysUtils = require('../utils/system');

module.exports.policies = {
    
    '*': [
        
        function (req, res, next) {
            "use strict";
            if (req.body.token) {
                jwt.verify(req.body.token, sails.config.JWT_KEY, function (err, decoded) {
                    if (!err && decoded) {
                        req.principal = {user: decoded};
                        next();
                    }
                    else {
                        res.json(sysUtils.returnError(_app.errors.TOKEN_INVALID_ERROR));
                    }
                });
            }
            else {
                req.principal = {};
                next();
            }
        }
    ]
};
