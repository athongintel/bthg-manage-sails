const randomstring = require('randomstring');
const bcryptUtils = require('../../utils/bcrypt');
const cryptoUtils = require('../../utils/crypto');

let createSuperAdminAccount = async function(){
    "use strict";
    //-- check if super admin existed
    let superAdmin = await _app.model.User.findOne({userClass: _app.model.User.constants.SUPER_ADMIN});
    if (!superAdmin){
        console.log('- creating super admin account');
        
        let user = new _app.model.User({
            username: sails.config.SUPER_ADMIN_USERNAME,
            userClass: [_app.model.User.constants.NORMAL_USER, _app.model.User.constants.SUPER_ADMIN],
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
    }
};

module.exports = {
  
  init: async function(params){
    "use strict";
    try {
        await createSuperAdminAccount();
        return {success: true};
    }
    catch(err){
        console.log(err);
        return {success: false};
    }
  },
  
  login: async function (principal, params) {
    "use strict";
    /*
        params:{
            authMethod: login method in Auth
            authInfo: depending on authMethod
        }
     */
  }
};
