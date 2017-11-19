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
    
    getAllBranches: async function(principal, params){
        "use strict";
        /*
            params: {
                query: the query for name
            }
         */
        try{
            let branches = await _app.model.Branch.find();
            let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`, 'i');
            branches = branches.filter(branch=>{
                return !!regex.exec(sysUtils.removeAccent(branch.name));
            });
            return sysUtils.returnSuccess(branches);
        }
        catch(err){
            console.log('getAllBranches:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getBranch: async function(principal, params){
        "use strict";
        /*
            params: {
                _id: the id of branch
            }
         */
        try{
            let branch = await _app.model.Branch.findById(params._id);
            return sysUtils.returnSuccess(branch);
        }
        catch(err){
            console.log('getBranch:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    }
    
    
};
