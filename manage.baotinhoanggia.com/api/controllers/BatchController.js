const PO = require('../policies/Policies');

const UserService = require('../services/UserService');
const CustomerService = require('../services/CustomerService');
const SupplierService = require('../services/SupplierService');
const SystemService = require('../services/SystemService');
const BranchService = require('../services/BranchService');

const sysUtils = require('../../utils/system');

const actions = {
    'login': {policies: [], action: UserService.login, validation: {required: ['username', 'authMethod', 'authData']}},
    'check_attribute': {policies: [PO.isAuthenticated, PO.isAdmin], action: SystemService.checkAttribute, validation: {required: ['collection', 'pairs']}},
    'filter_collection': {policies: [PO.isAuthenticated, PO.isAdmin], action: SystemService.filterCollection, validation: {required: ['collection', 'filter']}},
    
    'add_customer': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.addCustomer, validation: {required: ['name', 'code']}},
    'update_customer_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.updateCustomerInfo, validation: {required: ['_id', 'name', 'code']}},
    'get_customer_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getCustomerInfo, validation: {required: ['_id']}},
    'get_customer_meta_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getCustomerMetaInfo, validation: {}},
    'get_all_customer_contacts': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getAllCustomerContacts, validation: {required: ['customerID']}},
    'add_customer_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.addCustomerContact, validation: {required: ['customerID', 'name']}},
    'update_customer_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.updateCustomerContact, validation: {required: ['_id', 'name']}},
    'remove_customer_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.removeCustomerContact, validation: {required: ['_id']}},
    
    'add_supplier': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.addSupplier, validation: {required: ['name']}},
    'update_supplier_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.updateSupplierInfo, validation: {required: ['_id', 'name']}},
    'get_supplier_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.getSupplierInfo, validation: {required: ['_id']}},
    'get_all_suppliers': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.getAllSuppliers, validation: {}},
    'get_all_supplier_contacts': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.getAllSupplierContacts, validation: {required: ['supplierID']}},
    'add_supplier_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.addSupplierContact, validation: {required: ['supplierID', 'name']}},
    'update_supplier_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.updateSupplierContact, validation: {required: ['_id', 'name']}},
    'remove_supplier_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.removeSupplierContact, validation: {required: ['_id']}},
    
    'add_product_category': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.addProductCategory, validation: {required: ['name']}},
    'remove_product_category': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.removeProductCategory, validation: {required: ['_id']}},
    'update_product_category': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.updateProductCategory, validation: {required: ['_id', 'name']}},
    'get_all_product_categories': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllProductCategories, validation: {}},
    
    'add_product_brand': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.addProductBrand, validation: {required: ['name']}},
    'remove_product_brand': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.removeProductBrand, validation: {required: ['_id']}},
    'update_product_brand': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.updateProductBrand, validation: {required: ['_id', 'name']}},
    'get_all_product_brands': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllProductBrands, validation: {}},
    
    'add_product_type': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.addProductType, validation: {required: ['groupID', 'name']}},
    'remove_product_type': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.removeProductType, validation: {required: ['_id']}},
    'update_product_type': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.updateProductType, validation: {required: ['_id', 'name']}},
    'get_all_types_from_category': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllTypesFromCategory, validation: {required: ['groupID']}},
    
    'add_product': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.addProduct, validation: {required: ['typeID', 'brandID', 'model']}},
    'get_product': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getProduct, validation: {required: ['_id']}},
    'update_product': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.updateProduct, validation: {required: ['_id', 'model']}},
    'remove_product_photo': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.removeProductPhoto, validation: {required: ['_id', 'fileName']}},
    
    'get_all_branches': {policies: [PO.isAuthenticated, PO.isAdmin], action: BranchService.getAllBranches, validation: {required: []}},
};

/*
	RPC:
	{
		name:
		params:{
		}
	}

	BATCH:
	{
		options:{
			serial: whether run these below commands serially, default to false,
			serialStop: whether one failed command aborts the rest,
		},
		commands:[
			{
				name: action name,
				params:{
				}
			}, ...
		]
	}
*/


let policiesCheck = async function (policies, principal, params) {
    for (let i = 0; i < policies.length; i++) {
        let result = await policies[i](principal, params);
        if (!result.success)
            return result;
    }
    return sysUtils.returnSuccess();
};

let runOneCommand = async function (principal, commandName, params) {
    "use strict";
    
    //-- check command & command params
    if (!commandName || !params || !actions[commandName] || !actions[commandName].action)
        return sysUtils.returnError(_app.errors.MALFORMED_REQUEST_ERROR);
    
    //-- validation check
    if (actions[commandName].validation){
        if (actions[commandName].validation.required && actions[commandName].validation.required.length){
            let missing = actions[commandName].validation.required.some(attr=>{
               if (params[attr] === '' || params[attr] === undefined || params[attr] === null){
                   return true;
               }
            });
            if (missing) return sysUtils.returnError(_app.errors.INPUT_ERROR);
        }
    }
    
    //-- policy check
    if (actions[commandName].policies && actions[commandName].policies.length) {
        let policiesResult = await policiesCheck(actions[commandName].policies, principal, params);
        if (!policiesResult.success)
            return policiesResult;
    }
    
    //-- run the command
    return await actions[commandName].action(principal, params);
};

module.exports = {
    
    rpc: function (req, res) {
        /**
         * @api {post} /rpc RPC
         * @apiGroup API
         * @apiParam {String} name Name of method
         * @apiParam {Object} params List params of method
         * @apiParamExample {json} Input
         *   {
         *      "name": "sign_in",
         *      "params": {
         *         "email": "your_email@gmail.com",
         *          "password": "your_password",
         *      }
         *   }
         * @apiSuccessExample {json} success
         *   {
         *      "success": true,
         *      "result": ''
         *   }
         * @apiErrorExample {json} error
         *   {
         *      "success": false,
         *      "error": {
         *          "errorCode": 3,
         *          "errorMessage": "System error"
         *      }
         *      "extra": "optional"
         *   }
         */
        "use strict";
        console.log(JSON.stringify(req.body));
        new Promise(async (resolve, reject) => {
            try {
                req.principal.req = req;
                req.principal.res = res;
                return resolve(await(runOneCommand(req.principal, req.body.name, req.body.params)));
            }
            catch (err) {
                return reject(err)
            }
        }).then(
            function (result) {
                console.log(result);
                res.json(result);
            },
            function (err) {
                console.log(err);
                res.json(sysUtils.returnError(_app.errors.SYSTEM_ERROR));
            }
        );
    },
    
    batch: function (req, res) {
        /**
         * @api {post} /batch BATCH
         * @apiGroup API
         * @apiParam {Object} options Options of request
         * @apiParam {Object[]} commands List object of name and params of method
         * @apiParamExample {json} Input
         *   {
         *      "options": {},
         *      "commands": [
         *          {
         *              "name": "get_store_info",
         *              "params": {
         *                  "storeId": "59b78b7117fcd042d067501f"
         *              }
         *          },
         *          {
         *              "name": "get_asset",
         *              "params": {
         *                  "asset_code": "USD"
         *              }
         *          }
         *      ]
         *   }
         * @apiSuccessExample {json} success
         *   {
         *      "success": true,
         *      "result": ''
         *   }
         * @apiErrorExample {json} error
         *   {
         *      "success": false,
         *      "error": {
         *          "errorCode": 3,
         *          "errorMessage": "System error"
         *      }
         *      "extra": "optional"
         *   }
         */
        "use strict";
        console.log(JSON.stringify(req.body));
        new Promise(async (resolve, reject) => {
            try {
                req.principal.req = req;
                req.principal.res = res;
                //return resolve(await(runOneCommand(req.principal, req.body.name, req.body.params)));
                
                if (!req.body.options || !req.body.commands || req.body.commands.length > sails.config.BATCH_MAX_COMMAND_NUMBER)
                    return resolve(sysUtils.returnError(_app.errors.MALFORMED_REQUEST_ERROR));
                
                let results = [];
                if (req.body.options.serial) {
                    for (let cIndex = 0; cIndex < req.body.commands.length; cIndex++) {
                        let result = await runOneCommand(req.principal, req.body.commands[cIndex].name, req.body.commands[cIndex].params);
                        if (!result.success && req.body.options.serialStop)
                            return resolve(sysUtils.returnError(_app.errors.EXECUTION_HALTED_ERROR));
                        else
                            results.push(result);
                    }
                    return resolve({success: true, results: results});
                }
                else {
                    let promises = [];
                    req.body.commands.forEach(command => {
                        promises.push(runOneCommand(req.principal, command.name, command.params));
                    });
                    return resolve(sysUtils.returnSuccess(await Promise.all(promises)));
                }
                
            }
            catch (err) {
                return reject(err)
            }
        }).then(
            function (result) {
                console.log(result);
                res.json(result);
            },
            function (err) {
                console.log(err);
                res.json(sysUtils.returnError(_app.errors.SYSTEM_ERROR));
            }
        );
    }
};
