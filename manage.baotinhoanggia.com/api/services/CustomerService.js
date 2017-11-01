const sysUtils = require('../../utils/system');

module.exports = {
    
    addCustomer: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required, unique] name: customer name,
                [required, unique] code: the shortened code of customer,
                phoneNumber,
                faxNumber,
                address
            }
         */
        
        try {
            //-- check for unique name and code
            let customer = await _app.model.Customer.findOne({name: params.name});
            if (customer)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
    
            customer = await _app.model.Customer.findOne({code: params.code});
            if (customer)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            customer = new _app.model.Customer({
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
    
    updateCustomerInfo: async function(principal, params){
        "use strict";
        /*
            params:{
                [required] _id: id of the customer,
                [required] name: customer's name
                [required] code: customer's code
                phoneNumber,
                faxNumber,
                address
            }
         */
        
        try {
            let customer = await _app.model.Customer.findById(params._id);
            if (!customer)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            customer.name = params.name;
            customer.code = params.code;
            customer.phoneNumber = params.phoneNumber;
            customer.faxNumber = params.faxNumber;
            customer.address = params.address;
            
            await customer.save();
            
            return sysUtils.returnSuccess(null);
        }
        catch (err) {
            console.log('updateCustomerInfo:', err);
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
            let customers = await _app.model.Customer.find({}).select('_id name');
            if (params.query){
                let regex = new RegExp(`.*${sysUtils.regexEscape(params.query)}.*`,'i');
                customers = customers.filter(c=>{
                    return !!regex.exec(c.name);
                });
            }
            return sysUtils.returnSuccess(customers);
        }
        catch (err) {
            console.log('getCustomerMetaInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllCustomerContacts: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] customerID: customer id
            }
         */
        try {
            let contacts = await _app.model.CustomerContact.find({customerID: params.customerID});
            return sysUtils.returnSuccess(contacts);
        }
        catch (err) {
            console.log('getAllCustomerContacts:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    addCustomerContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] customerID: customer id
                [required] name: contact name
                position,
                phoneNumber,
                email,
                discount,
            }
         */
        try {
            let contact = await _app.model.CustomerContact({
                customerID: params.customerID,
                name: params.name,
                position: params.position,
                phoneNumber: params.phoneNumber,
                email: params.email,
                discount: params.discount
            });
            contact = await contact.save();
            return sysUtils.returnSuccess(contact);
        }
        catch (err) {
            console.log('addCustomerContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateCustomerContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: customer id
                [required] name: contact name
                position,
                phoneNumber,
                email,
                discount,
            }
         */
        try {
            let contact = await _app.model.CustomerContact.findById(params._id);
            contact.name = params.name;
            contact.position = params.position;
            contact.phoneNumber = params.phoneNumber;
            contact.email = params.email;
            contact.discount = params.discount;
            contact = await contact.save();
            
            return sysUtils.returnSuccess(contact);
        }
        catch (err) {
            console.log('updateCustomerContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeCustomerContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: the contact id
            }
         */
        try {
            let contact = await _app.model.CustomerContact.findByIdAndRemove(params._id);
            if (!contact)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('removeCustomerContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
};
