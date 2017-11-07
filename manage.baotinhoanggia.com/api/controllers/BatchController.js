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
    
    'add_customer': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: CustomerService.addCustomer, validation: {required: ['name', 'code']}},
    'update_customer_info': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: CustomerService.updateCustomerInfo, validation: {required: ['_id', 'name', 'code']}},
    'get_customer_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getCustomerInfo, validation: {required: ['_id']}},
    'get_all_customers': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getAllCustomers, validation: {}},
    'get_all_customer_contacts': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: CustomerService.getAllCustomerContacts, validation: {required: ['customerID']}},
    'add_customer_contact': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: CustomerService.addCustomerContact, validation: {required: ['customerID', 'name']}},
    'update_customer_contact': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: CustomerService.updateCustomerContact, validation: {required: ['_id', 'name']}},
    'remove_customer_contact': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: CustomerService.removeCustomerContact, validation: {required: ['_id']}},
    
    'add_supplier': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: SupplierService.addSupplier, validation: {required: ['name']}},
    'update_supplier_info': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: SupplierService.updateSupplierInfo, validation: {required: ['_id', 'name']}},
    'get_supplier_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.getSupplierInfo, validation: {required: ['_id']}},
    'get_all_product_suppliers': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.getAllProductSuppliers, validation: {}},
    'get_all_supplier_contacts': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.getAllSupplierContacts, validation: {required: ['supplierID']}},
    'add_supplier_contact': {policies: [PO.isAuthenticated, PO.isAdmin], action: SupplierService.addSupplierContact, validation: {required: ['supplierID', 'name']}},
    'update_supplier_contact': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: SupplierService.updateSupplierContact, validation: {required: ['_id', 'name']}},
    'remove_supplier_contact': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: SupplierService.removeSupplierContact, validation: {required: ['_id']}},
    
    'add_product_category': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.addProductCategory, validation: {required: ['name']}},
    'get_product_category': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getProductCategory, validation: {required: ['_id']}},
    'remove_product_category': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.removeProductCategory, validation: {required: ['_id']}},
    'update_product_category': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.updateProductCategory, validation: {required: ['_id', 'name']}},
    'get_all_product_categories': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllProductCategories, validation: {}},
    
    'add_product_brand': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.addProductBrand, validation: {required: ['name']}},
    'get_product_brand': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getProductBrand, validation: {required: ['_id']}},
    'remove_product_brand': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.removeProductBrand, validation: {required: ['_id']}},
    'update_product_brand': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.updateProductBrand, validation: {required: ['_id', 'name']}},
    'get_all_product_brands': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllProductBrands, validation: {}},
    
    'add_product_type': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.addProductType, validation: {required: ['groupID', 'name']}},
    'get_product_type': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getProductType, validation: {required: ['_id']}},
    'remove_product_type': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.removeProductType, validation: {required: ['_id']}},
    'update_product_type': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.updateProductType, validation: {required: ['_id', 'name']}},
    'get_all_product_types': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllProductTypes, validation: {required: []}},
    'get_all_types_from_category': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllTypesFromCategory, validation: {required: ['groupID']}},
    
    'add_product': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.addProduct, validation: {required: ['typeID', 'brandID', 'model']}},
    'remove_product': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.removeProduct, validation: {required: ['_id']}},
    'get_product': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getProduct, validation: {required: ['_id']}},
    'get_all_products_with_details': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.getAllProductsWithDetails, validation: {required: []}},
    'update_product': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.updateProduct, validation: {required: ['_id', 'model', 'typeID', 'brandID']}},
    'remove_product_photos': {policies: [PO.isAuthenticated, PO.isAdmin], action: ProductService.removeProductPhotos, validation: {required: ['_id', 'fileNames']}},
    'change_product_price_manually': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: ProductService.changeProductPrice, validation: {required: ['_id', 'price']}},
    
    'get_all_branches': {policies: [PO.isAuthenticated, PO.isAdmin], action: BranchService.getAllBranches, validation: {required: []}},
    
    'create_out_order': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: OutOrderService.createOrder, validation: {required: ['name', 'customerID', 'branchID']}},
    'get_all_out_orders': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: OutOrderService.getAllOutOrders, validation: {required: []}},
    'create_quotation': {policies: [PO.isAuthenticated, PO.isSuperAdmin], action: OutOrderService.createQuotation, validation: {required: ['outStockOrderID', 'customerContactID', 'details']}},
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
                if (!result.success) console.log(result);
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
                if (!result.success) console.log(result);
                res.json(result);
            },
            function (err) {
                console.log(err);
                res.json(sysUtils.returnError(_app.errors.SYSTEM_ERROR));
            }
        );
    }
};
