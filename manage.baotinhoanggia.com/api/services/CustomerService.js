const sysUtils = require('../../utils/system');

module.exports = {
    
    addCustomer: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] name: customer name,
                [required] code: the shortened code of customer,
                phoneNumber,
                faxNumber,
                address
            }
         */
        
        try {
            let customer = new _app.model.Customer({
                name: params.name,
                code: params.code,
                phoneNumber: params.phoneNumber,
                faxNumber: params.faxNumber,
                address: params.address
            });
            
            customer = await customer.save();
            
            return sysUtils.returnSuccess(customer);
            
        }
        catch (err) {
            console.log('addCustomer:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
        
    },
    
    getCustomerInfo: async function(principal, params){
        "use strict";
        /*
            params:{
                _id: id of the customer
            }
         */
        
        try {
            let customer = await _app.model.Customer.findById(params._id);
            return sysUtils.returnSuccess(customer);
        }
        catch (err) {
            console.log('getCustomerInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getCustomerMetaInfo: async function (principal, params) {
        "use strict";
        /*
            params:{
                query: to query the name
            }
         */
        try {
            let customers = await _app.model.Customer.find({name: {$regex: '.*' + params.query + '.*'}}).select('_id name');
            return sysUtils.returnSuccess(customers);
        }
        catch (err) {
            console.log('getCustomerMetaInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
};
