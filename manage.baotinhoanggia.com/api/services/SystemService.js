const sysUtils = require('../../utils/system');

module.exports = {
    checkAttribute: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] collection: collection to be checked
                [required] attr: customer attr (name)
                [required] value: the value to be checked
            }
         */
        try {
            if (!_app.model[params.collection])
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let existed = await _app.model[params.collection].findOne().where(params.attr, params.value).exec();
            if (existed)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('checkAttribute:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
};
