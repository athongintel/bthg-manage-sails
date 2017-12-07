const sysUtils = require('../../utils/system');

const aws = require('aws-sdk');
const mongoDbRestore = require('mongodb-restore');
const mongoDbBackup = require('mongodb-backup');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Cron = require('cron').CronJob;
const BigNumber = require('bignumber.js');

const backupDir = path.join(__dirname, '../backup-db');

const runBackup = async function () {
    
    let date = moment().format(sails.config.TIME_FORMAT);
    let backupFileName = sails.config.BACKUP_FILE_PREFIX + date + '.tar';
    
    return await new Promise((resolve) => {
        mongoDbBackup({
            uri: `mongodb://${sails.config.MONGO_USERNAME && sails.config.MONGO_USERPASSWORD ? sails.config.MONGO_USERNAME + ':' + sails.config.MONGO_USERPASSWORD + '@' : ''}${sails.config.MONGO_SERVER}:${sails.config.MONGO_PORT}/${sails.config.MONGO_DBNAME}`,
            root: backupDir,
            tar: backupFileName,
            callback: function (err) {
                if (!err) {
                    //-- Upload file to S3
                    let pathToBackupFile = path.join(backupDir, backupFileName);
                    fs.readFile(pathToBackupFile, (err, backupData) => {
                        if (err) {
                            resolve(sysUtils.returnError(_app.errors.SYSTEM_ERROR));
                        }
                        else {
                            let binaryData = new Buffer(backupData, 'binary');
                            let param = {
                                Body: binaryData,
                                Key: backupFileName,
                                Bucket: sails.config.S3_DB_BACKUP_BUCKET
                            };
                            _app.S3.putObject(param, (err) => {
                                if (err) {
                                    resolve(sysUtils.returnError(_app.errors.SYSTEM_ERROR));
                                }
                                else {
                                    fs.unlinkSync(pathToBackupFile);
                                    resolve(sysUtils.returnSuccess({Key: param.Key, Size: binaryData.length}));
                                }
                            });
                        }
                    });
                }
                else {
                    resolve(sysUtils.returnError(_app.errors.SYSTEM_ERROR));
                }
            }
        });
    });
};
const runBackupWithCronJob = async function () {
    try {
        console.log('- set db backup life cycle');
        let params = {
            Bucket: sails.config.S3_DB_BACKUP_BUCKET,
            LifecycleConfiguration: {
                Rules: [
                    {
                        Prefix: sails.config.BACKUP_FILE_PREFIX,
                        Expiration: {
                            Days: 7
                        },
                        ID: "bthg-db-backup-life-cycle",
                        Status: "Enabled",
                    }
                ]
            }
        };
        await _app.S3.putBucketLifecycleConfiguration(params).promise();
        
        return await new Promise((resolve) => {
            new Cron(`00 00 */${sails.config.BACKUP_INTERVAL_HOUR} * * *`, async function () {
                try {
                    await runBackup();
                    console.log('[SYSTEM] db backed-up success at ', moment().format(sails.config.TIME_FORMAT));
                }
                catch (err) {
                    console.log('[SYSTEM] db backed-up FAILURE at ', moment().format(sails.config.TIME_FORMAT));
                }
            }, null, true, sails.config.TIME_ZONE);
            resolve(sysUtils.returnSuccess());
        });
    }
    catch (err) {
        console.log('runBackupWithCronJob: ', err);
        return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
    }
};
const setSystemDefaultVariables = async function () {
    "use strict";
    let systemReset = await _app.model.SystemVariable.findOne({name: 'SYSTEM_RESET'});
    if (!systemReset)
        systemReset = await new _app.model.SystemVariable({name: 'SYSTEM_RESET', value: '1'}).save();
    
    if (systemReset.value === '1') {
        systemReset.value = '0';
        await systemReset.save();
        
        console.log('- init system variables');
        let promises = [];
        
        let DEFAULT_TERMS = await _app.model.SystemVariable.findOne({name: 'DEFAULT_TERMS'});
        if (!DEFAULT_TERMS)
            promises.push(new _app.model.SystemVariable({name: 'DEFAULT_TERMS', value: ''}).save());
        
        let COMPANY_INFO = await _app.model.SystemVariable.findOne({name: 'COMPANY_INFO'});
        if (!COMPANY_INFO)
            promises.push(new _app.model.SystemVariable({
                name: 'COMPANY_INFO',
                value: JSON.stringify({name: '', business: '', contactInfo: '', address: ''})
            }).save());
        
        await Promise.all(promises);
    }
    
    return sysUtils.returnSuccess();
};

module.exports = {
    
    init: async function (params) {
        "use strict";
        
        moment.tz.setDefault(sails.config.TIME_ZONE);
        BigNumber.config({DECIMAL_PLACES: sails.config.CURRENCY_DECIMAL_PLACES});
        
        aws.config.update({
            accessKeyId: sails.config.AWS_API_ID,
            secretAccessKey: sails.config.AWS_API_KEY
        });
        
        aws.config.setPromisesDependency(global.Promise);
        _app.S3 = new aws.S3();
        
        let result;
        
        if (sails.config.BACKUP_DB_CRON_JOB) {
            result = await runBackupWithCronJob();
            if (!result.success)
                return result;
    
            result = await setSystemDefaultVariables();
            if (!result.success)
                return result;
        }
        else{
            console.log('- local not backup db');
        }
        
        return sysUtils.returnSuccess();
    },
    
    fixProductPrice: async function(principal, params){
        "use strict";
        try {
            let products = await _app.model.Product.find({});
            //console.log('fixProductPrice, products', products);
            for (let i=0; i<products.length; i++){
                let product = products[i];
                //-- get last outStock
                let lastStock = await _app.model.OutStock.find({productID: product._id, metaInfo: {$in : ['STOCK_INIT_STOCK', 'STOCK_MANUAL_CHANGE']}}).sort({createdAt: -1});
                //console.log('fixProductPrice, lastStock: ', lastStock);
                //-- fix price for this product
                if (lastStock && lastStock.length) {
                    product.price = lastStock[0].price;
                    await product.save();
                }
            }
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('fixProductPrice:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    checkAttribute: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] collection: collection to be checked
                [required] pairs: array of {attr, value} to be checked
            }
         */
        try {
            if (!_app.model[params.collection])
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let promise = _app.model[params.collection].findOne();
            params.pairs.forEach(pair => {
                promise = promise.where(pair.attr, pair.value);
            });
            
            let existed = await promise.exec();
            
            if (existed)
                return sysUtils.returnError(_app.errors.DUPLICATED_ERROR);
            
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('checkAttribute:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getSystemVariable: async function (principal, params) {
        "use strict";
        /*
            params: {
                name: name of the variable
            }
         */
        try {
            let systemVariable = await _app.model.SystemVariable.findOne({name: params.name});
            if (!systemVariable) return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess(systemVariable);
        }
        catch (err) {
            console.log('getSystemVariable:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    setSystemVariable: async function (principal, params) {
        "use strict";
        /*
            params:{
                name: variable name,
                value: variable value
            }
         */
        try {
            let systemVariable = await _app.model.SystemVariable.findOne({name: params.name});
            if (!systemVariable) return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            systemVariable.value = params.value;
            await systemVariable.save();
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('setSystemVariable:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    filterCollection: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] collection: collection to be checked
                [required] filter: array of {attr, value}
            }
         */
        try {
            if (!_app.model[params.collection])
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            let promise = _app.model[params.collection].find();
            params.filter.forEach(pair => {
                promise = promise.where(pair.attr, pair.value);
            });
            
            let result = await promise.exec();
            
            return sysUtils.returnSuccess(result);
        }
        catch (err) {
            console.log('filterCollection:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
};
