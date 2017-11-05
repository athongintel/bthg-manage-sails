const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');

const bcryptUtils = require('../../utils/bcrypt');
const cryptoUtils = require('../../utils/crypto');
const sysUtils = require('../../utils/system');

let createSuperAdminAccount = async function () {
    "use strict";
    //-- check if super admin existed
    let superAdmin = await _app.model.User.findOne({userClass: _app.model.User.constants.SUPER_ADMIN});
    if (superAdmin)
        return sysUtils.returnSuccess();
    
    console.log('- creating super admin account');
    
    let headerQuarter = await _app.model.Branch.findOne({type: _app.model.Branch.constants.BRANCH_HEADQUARTER});
    if (!headerQuarter)
        return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
    
    let user = new _app.model.User({
        username: sails.config.SUPER_ADMIN_USERNAME,
        branchID: headerQuarter._id,
        userClass: [_app.model.User.constants.NORMAL_USER, _app.model.User.constants.NORMAL_ADMIN, _app.model.User.constants.SUPER_ADMIN],
    });
    
    user = await user.save();
    
    let salt = randomstring.generate(sails.config.SALT_LENGTH);
    let hashPassword = await bcryptUtils.hash(`${sails.config.SUPER_ADMIN_DEFAULT_PASSWORD}${salt}`);
    
    let auth = new _app.model.Auth({
        userID: user._id,
        authMethod: _app.model.Auth.constants.AUTH_USERNAME,
        extra1: sails.config.SUPER_ADMIN_USERNAME,
        extra2: hashPassword,
        extra3: salt
    });
    
    await auth.save();
    
    return sysUtils.returnSuccess();
    
};

let generateUserToken = async function (userData) {
    return await new Promise((resolve, reject) => {
        jwt.sign(userData, sails.config.JWT_KEY, {expiresIn: "12h"}, function (err, token) {
            return resolve(!err && token ? token : null);
        });
    });
};


module.exports = {
    
    init: async function (params) {
        "use strict";
        try {
            let result = await createSuperAdminAccount();
            if (!result.success) return result;
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log(err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    login: async function (principal, params) {
        "use strict";
        /*
			params:{
			    [required] username: user's identity
				[required] authMethod: login method in Auth
				[required] authData: depending on authMethod
			}
			
			return:{
				success: true,
				result: {
					<user model info>,
					<inject token>
				}
			}
		 */
        try {
            let user = await _app.model.User.findOne({username: params.username}).populate('branchID').lean();
            if (!user)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let auth = await _app.model.Auth.findOne({userID: user._id, authMethod: params.authMethod});
            if (!auth)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            switch (auth.authMethod) {
                case _app.model.Auth.constants.AUTH_USERNAME:
                    //-- check username and password
                    let passWithSalt = `${params.authData.password}${auth.extra3}`;
                    let result = await bcryptUtils.compare(passWithSalt, auth.extra2);
                    
                    //-- TODO: save login history
                    
                    if (!result)
                        return sysUtils.returnError(_app.errors.WRONG_PASSWORD_ERROR);
                    
                    //-- create login token
                    let token = await generateUserToken(user);
                    if (!token)
                        return sysUtils.returnError(_app.errors.TOKEN_GENERATING_ERROR);
                    user.token = token;
                    
                    return sysUtils.returnSuccess(user);
                    break;
                
                default:
                    return sysUtils.returnError(_app.errors.INPUT_ERROR);
            }
        }
        catch (err) {
            console.log('login:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    }
};
