const sysUtils = require('../../utils/system');

module.exports = {
    
    createOrder: async function (principal, params) {
        "use strict";
        /*
            params:{
                name: order name,
                [required] customerID,
                [required] branchID (branch that fulfill the order),
            }
         */
        try {
            let outStockOrder = new _app.model.OutStockOrder({
                name: params.name,
                customerID: params.customerID,
                branchID: params.branchID,
                userID: principal.user._id
            });
            
            outStockOrder = await outStockOrder.save();
            return sysUtils.returnSuccess(outStockOrder);
        }
        catch (err) {
            console.log('createOrder:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    createQuotation: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] outStockOrderID: id of the out stock order
                [required] customerContactID: id of the contact that receives this quotation
                [required] details: [{
                    productID: productID,
                    amount: amount,
                    price: price
                }]
            }
         */
        try {
            let outStockOrder = await _app.model.OutStockOrder.findById(params.outStockOrderID);
            if (!outStockOrder)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            if (!params.details.length)
                return sysUtils.returnError(_app.errors.MALFORMED_REQUEST_ERROR);
            
            let quotation = new _app.model.Quotation({
                outStockOrderID: params.outStockOrderID,
                userID: principal.user._id,
                customerContactID: params.customerContactID,
            });
            
            quotation = await quotation.save();
            
            //-- create details
            let quotationDetails = [];
            params.details.forEach(detail => {
                quotationDetails.push(new _app.model.QuotationDetails({
                    quotationID: quotation._id,
                    productID: detail.productID,
                    amount: detail.amount,
                    price: detail.price
                }).save());
            });
            
            await Promise.all(quotationDetails);
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('createQuotation:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    }
    
};
