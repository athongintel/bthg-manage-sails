const sysUtils = require('../../utils/system');

module.exports = {
    
    addSupplier: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] name: supplier name,
                address,
                phoneNumber,
                website,
                iban,
                bank,
                bankAddress,
                swift,
            }
         */
        
        try {
            let supplier = new _app.model.Supplier({
                name: params.name,
                address: params.address,
                phoneNumber: params.phoneNumber,
                website: params.website,
                iban: params.iban,
                bank: params.bank,
                bankAddress: params.bankAddress,
                swift: params.swift,
            });
            
            supplier = await supplier.save();
            
            return sysUtils.returnSuccess(supplier);
            
        }
        catch (err) {
            console.log('addSupplier:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
        
    },
    
    getSupplierInfo: async function(principal, params){
        "use strict";
        /*
            params:{
                _id: id of the supplier
            }
         */
        
        try {
            let supplier = await _app.model.Supplier.findById(params._id);
            return sysUtils.returnSuccess(supplier);
        }
        catch (err) {
            console.log('getSupplierInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateSupplierInfo: async function(principal, params){
        "use strict";
        /*
            params:{
                [required] name: supplier name,
                address,
                phoneNumber,
                website,
                iban,
                bank,
                bankAddress,
                swift,
            }
         */
        
        try {
            let supplier = await _app.model.Supplier.findById(params._id);
            if (!supplier)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            supplier.name = params.name;
            supplier.address = params.address;
            supplier.phoneNumber = params.phoneNumber;
            supplier.website = params.website;
            supplier.iban = params.iban;
            supplier.bank = params.bank;
            supplier.bankAddress = params.bankAddress;
            supplier.swift = params.swift;
            
            await supplier.save();
            
            return sysUtils.returnSuccess(null);
        }
        catch (err) {
            console.log('updateSupplierInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllSuppliers: async function (principal, params) {
        "use strict";
        /*
            params:{
                query: to query the name
            }
         */
        try {
            let suppliers = await _app.model.Supplier.find({});
            if (params.query){
                let regex = new RegExp(`.*${params.query}.*`, 'i');
                suppliers = suppliers.filter(s=>{
                    return !!regex.exec(s.name);
                });
            }
            return sysUtils.returnSuccess(suppliers);
        }
        catch (err) {
            console.log('getSupplierMetaInfo:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllSupplierContacts: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] supplierID: supplier id
            }
         */
        try {
            let contacts = await _app.model.SupplierContact.find({supplierID: params.supplierID});
            return sysUtils.returnSuccess(contacts);
        }
        catch (err) {
            console.log('getAllSupplierContacts:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    addSupplierContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] supplierID: supplier id
                title,
                [required] name: contact name
                lastName: contact last name
                lastName: contact last name
                position,
                phoneNumber,
                email,
            }
         */
        try {
            let contact = await _app.model.SupplierContact({
                supplierID: params.supplierID,
                title: params.title,
                name: params.name,
                lastName: params.lastName,
                position: params.position,
                phoneNumber: params.phoneNumber,
                email: params.email,
            });
            contact = await contact.save();
            return sysUtils.returnSuccess(contact);
        }
        catch (err) {
            console.log('addSupplierContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    updateSupplierContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: supplier id
                title,
                [required] name: contact name
                lastName: contact last name
                position,
                phoneNumber,
                email,
            }
         */
        try {
            let contact = await _app.model.SupplierContact.findById(params._id);
            contact.title = params.title;
            contact.name = params.name;
            contact.lastName = params.lastName;
            contact.position = params.position;
            contact.phoneNumber = params.phoneNumber;
            contact.email = params.email;
            contact = await contact.save();
            
            return sysUtils.returnSuccess(contact);
        }
        catch (err) {
            console.log('updateSupplierContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    removeSupplierContact: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: the contact id
            }
         */
        try {
            let contact = await _app.model.SupplierContact.findByIdAndRemove(params._id);
            if (!contact)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('removeSupplierContact:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
};
