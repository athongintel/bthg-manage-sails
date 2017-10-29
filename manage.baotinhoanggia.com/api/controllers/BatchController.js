const PO = require('../policies/Policies');

const UserService = require('../services/UserService');
const CustomerService = require('../services/CustomerService');

const actions = {
    'login': {policies: [], action: UserService.login, validation: {required: ['username', 'authMethod', 'authData']}},
    
    'add_customer': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.addCustomer, validation: {required: ['name', 'code']}},
    'get_customer_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getCustomerInfo, validation: {required: ['_id']}},
    'get_customer_meta_info': {policies: [PO.isAuthenticated, PO.isAdmin], action: CustomerService.getCustomerMetaInfo, validation: {}},
    
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
    return {success: true};
};

let runOneCommand = async function (principal, commandName, params) {
    "use strict";
    
    //-- check command & command params
    if (!commandName || !params || !actions[commandName])
        return {success: false, error: _app.errors.MALFORMED_REQUEST_ERROR};
    
    //-- validation check
    if (actions[commandName].validation){
        if (actions[commandName].validation.required && actions[commandName].validation.required.length){
            let missing = actions[commandName].validation.required.some(attr=>{
               if (params[attr] === undefined || params[attr] === null){
                   return true;
               }
            });
            if (missing) return {success: false, error: _app.errors.INPUT_ERROR};
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
        console.log(req.body);
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
                res.json(result);
            },
            function (err) {
                console.log(err);
                res.json({success: false, error: _app.errors.SYSTEM_ERROR, extra: err});
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
        console.log(req.body);
        new Promise(async (resolve, reject) => {
            try {
                req.principal.req = req;
                req.principal.res = res;
                //return resolve(await(runOneCommand(req.principal, req.body.name, req.body.params)));
                
                if (!req.body.options || !req.body.commands || req.body.commands.length > sails.config.BATCH_MAX_COMMAND_NUMBER)
                    return resolve({success: false, error: _app.errors.MALFORMED_REQUEST_ERROR});
                
                let results = [];
                if (req.body.options.serial) {
                    for (let cIndex = 0; cIndex < req.body.commands.length; cIndex++) {
                        let result = await runOneCommand(req.principal, req.body.commands[cIndex].name, req.body.commands[cIndex].params);
                        if (!result.success && req.body.options.serialStop)
                            return resolve({success: false, error: _app.errors.EXECUTION_HALTED_ERROR, extra: results});
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
                    return resolve({success: true, results: await Promise.all(promises)});
                }
                
            }
            catch (err) {
                return reject(err)
            }
        }).then(
            function (result) {
                res.json(result);
            },
            function (err) {
                console.log(err);
                res.json({success: false, error: _app.errors.SYSTEM_ERROR, extra: err});
            }
        );
    }
};
