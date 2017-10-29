const jwt = require('jsonwebtoken');

module.exports.policies = {
    
    '*': [
        //-- token parsing middleware
        function (req, res, next) {
            "use strict";
            if (req.body.token) {
                jwt.verify(req.body.token, sails.config.JWT_KEY, function (err, decoded) {
                    if (!err && decoded) {
                        req.principal = {user: decoded};
                        next();
                    }
                    else {
                        res.json({success: false, error: _app.errors.TOKEN_INVALID_ERROR});
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
