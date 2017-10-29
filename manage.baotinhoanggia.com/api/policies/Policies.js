const sysUtils = require('../../utils/system');

module.exports = {
    
    isAuthenticated: async function(principal, params){
        "use strict";
        return principal.user?
            sysUtils.returnSuccess() : sysUtils.returnError(_app.errors.NOT_AUTHENTICATED_ERROR);
    },
    
    isAdmin: async function(principal, params){
        "use strict";
        return (principal.user.userClass.indexOf(_app.model.User.constants.SUPER_ADMIN) >= 0)?
            sysUtils.returnSuccess() : sysUtils.returnError(_app.errors.NOT_SUPER_ADMIN_ERROR);
    },
    
};
