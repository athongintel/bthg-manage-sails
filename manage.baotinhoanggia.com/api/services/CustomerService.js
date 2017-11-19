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
                address,
                companyInfo,
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
                address: params.address,
                companyInfo: params.companyInfo
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
                address,
                companyInfo
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
            customer.companyInfo = params.companyInfo;
            
            await customer.save();
            
            return sysUtils.returnSuccess(null);
        }
        catch (err) {
            console.log('updateCustomerInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllCustomers: async function (principal, params) {
        "use strict";
        /*
            params:{
                query: to query the name
            }
         */
        try {
            let customers = await _app.model.Customer.find({});
            if (params.query){
                let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`,'i');
                customers = customers.filter(c=>{
                    return !!regex.exec(sysUtils.removeAccent(c.name+JSON.stringify(c.companyInfo)));
                });
            }
            return sysUtils.returnSuccess(customers);
        }
        catch (err) {
            console.log('getAllCustomers:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllCustomerContacts: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] customerID: customer id
                query: query
            }
         */
        try {
            let contacts = await _app.model.CustomerContact.find({customerID: params.customerID});
            if (params.query){
                let regex = new RegExp(`.*${sysUtils.removeAccent(sysUtils.regexEscape(params.query))}.*`,'i');
                contacts = contacts.filter(c=>{
                    return !!regex.exec(sysUtils.removeAccent(c.name+c.lastName));
                });
            }
            
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
                title,
                [required] name: contact name
                lastName: contact last name
                position,
                phoneNumber,
                email,
                discount,
            }
         */
        try {
            let contact = await _app.model.CustomerContact({
                customerID: params.customerID,
                title: params.title,
                name: params.name,
                lastName: params.lastName,
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
    
    getCustomerContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: contact id
            }
         */
        try {
            let contact = await _app.model.CustomerContact.findById(params._id);
            return sysUtils.returnSuccess(contact);
        }
        catch (err) {
            console.log('getCustomerContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateCustomerContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: customer id
                title,
                [required] name: contact name
                lastName: contact last name
                position,
                phoneNumber,
                email,
                discount,
            }
         */
        try {
            let contact = await _app.model.CustomerContact.findById(params._id);
            contact.title = params.title;
            contact.name = params.name;
            contact.lastName = params.lastName;
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
