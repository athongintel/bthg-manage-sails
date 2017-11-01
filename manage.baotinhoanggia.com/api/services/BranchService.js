const sysUtils = require('../../utils/system');

let createHeadquarterBranch = async function () {
    "use strict";
    //-- check if super admin existed
    let headQuarter = await _app.model.Branch.findOne({type: _app.model.Branch.constants.BRANCH_HEADQUARTER});
    if (!headQuarter) {
        console.log('- creating headquarter');
        
        headQuarter = new _app.model.Branch({
            name: 'BTHG Headquarter',
            type: _app.model.Branch.constants.BRANCH_HEADQUARTER,
        });
        
        await headQuarter.save();
    }
    return sysUtils.returnSuccess();
};


module.exports = {
    
    init: async function (params) {
        "use strict";
        try {
            await createHeadquarterBranch();
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log(err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
};
