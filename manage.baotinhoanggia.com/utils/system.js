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
    }
};
