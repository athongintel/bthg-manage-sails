module.exports = {
    returnError: function(error){
        "use strict";
        return {success: false, error: error};
    },
    
    returnSuccess: function(result){
        "use strict";
        return {success: true, result: result};
    },
    
    regexEscape: function(exp){
        "use strict";
        if (!exp) return '';
        return String(exp).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },
    
    isSuperAdmin: function(principal){
        "use strict";
        return principal && principal.user && principal.user.userClass && principal.user.userClass.indexOf(_app.model.User.constants.SUPER_ADMIN) >= 0;
    }
};
