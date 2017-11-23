const sysUtils = require('../../utils/system');
const mongoose = require('mongoose');
const moment = require('moment');

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
            let code = '';
            
            //-- get customer
            let customer = await _app.model.Customer.findById(params.customerID);
            if (!customer)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            code += customer.code + '/';
            //-- get year and month
            code += moment().format('YYYY-MM') + '/';
            let orders = await _app.model.OutStockOrder.find({customerID: params.customerID, createdAt: {$gte: new Date(new Date().getFullYear(), 0, 1), $lt: new Date(new Date().getFullYear(), 11, 31)}});
            code += orders.length + '/BG';
            
            let outStockOrder = new _app.model.OutStockOrder({
                code: code,
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
    
    getOutOrderDetails: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: id of the out order
            }
         */
        try {
            let outStockOrder = await _app.model.OutStockOrder.aggregate(
                [
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(params._id)
                        }
                    },
                    {
                        $lookup: {
                            from: 'user',
                            localField: 'userID',
                            foreignField: '_id',
                            as: 'userID'
                        }
                    },
                    {
                        $unwind: {
                            path: "$userID",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'customer',
                            localField: 'customerID',
                            foreignField: '_id',
                            as: 'customerID'
                        }
                    },
                    {
                        $unwind: {
                            path: "$customerID",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'quotation',
                            localField: '_id',
                            foreignField: 'outStockOrderID',
                            as: 'quotations'
                        }
                    },
                    {
                        $unwind: {
                            path: "$quotations",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'user',
                            localField: 'quotations.userID',
                            foreignField: '_id',
                            as: 'quotations.userID'
                        }
                    },
                    {
                        $unwind: {
                            path: "$quotations.userID",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'customer',
                    //         localField: 'customerID',
                    //         foreignField: '_id',
                    //         as: 'customerID'
                    //     }
                    // },
                    // {
                    //     $unwind: {
                    //         path: "$customerID",
                    //         preserveNullAndEmptyArrays: true
                    //     }
                    // },
                    {
                        $lookup: {
                            from: 'quotationDetails',
                            localField: 'quotations._id',
                            foreignField: 'quotationID',
                            as: 'quotationDetails'
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            code: {$first: "$code"},
                            name: {$first: "$name"},
                            customerID: {$first: "$customerID"},
                            branchID: {$first: "$branchID"},
                            userID: {$first: "$userID"},
                            status: {$first: "$status"},
                            metaInfo: {$first: "$metaInfo"},
                            createdAt: {$first: "$createdAt"},
                            quots: {$addToSet: "$quotations"}
                        }
                    }
                ]
            );
            
            if (!outStockOrder || !outStockOrder.length)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess(outStockOrder[0]);
        }
        catch (err) {
            console.log('getOutOrderDetails:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getAllOutOrders: async function (principal, params) {
        "use strict";
        /*
            params:{
                status: order status,
                customerID: if of customer,
                productTypeID: type of product presented in the quotation of order
                dateRange: date range when the order had been created.
            }
         */
        try {
            let pipelines = [{
                $project: {
                    name: "$name",
                    customerID: "$customerID",
                    branchID: "$branchID",
                    userID: "$userID",
                    statusTimestamp: "$statusTimestamp",
                    metaInfo: "$metaInfo",
                }
            }];
            if (params.customerID !== null) {
                pipelines.push({
                    $match: {
                        customerID: mongoose.Types.ObjectId(params.customerID)
                    }
                });
            }
            
            if (params.productTypeID !== null) {
                pipelines = pipelines.concat([
                    {
                        $lookup: {
                            from: 'quotation',
                            localField: '_id',
                            foreignField: 'outStockOrderID',
                            as: 'quotations'
                        }
                    },
                    {
                        $unwind: {
                            path: "$quotations",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'quotationDetails',
                            localField: 'quotations._id',
                            foreignField: 'quotationID',
                            as: 'quotationDetails'
                        }
                    },
                    {
                        $unwind: {
                            path: "$quotationDetails",
                        }
                    },
                    {
                        $lookup: {
                            from: 'product',
                            localField: 'quotationDetails.productID',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $unwind: {
                            path: "$products",
                        }
                    },
                    {
                        $match: {
                            'products.typeID': mongoose.Types.ObjectId(params.productTypeID)
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            name: {$first: "$name"},
                            customerID: {$first: "$customerID"},
                            branchID: {$first: "$branchID"},
                            userID: {$first: "$userID"},
                            statusTimestamp: {$first: "$statusTimestamp"},
                            metaInfo: {$first: "$metaInfo"},
                            quots: {$addToSet: "$quotations"}
                        }
                    },
                ]);
            }
            
            if (params.dateRange !== null) {
                pipelines.push({
                    $match: {
                        createdAt: {
                            $gte: new Date(params.dateRange.date1),
                            $lte: new Date(params.dateRange.date2)
                        }
                    }
                });
            }
            
            let outOrders = await _app.model.OutStockOrder.aggregate(pipelines).exec();
    
            if (params.status !== null) {
                outOrders = outOrders.filter(order=>{
                    if (order.statusTimestamp && order.statusTimestamp.length) {
                        return String(order.statusTimestamp[order.statusTimestamp.length-1].status) === String(params.status);
                    }
                    else{
                        return false;
                    }
                });
            }
            
            return sysUtils.returnSuccess(outOrders);
        }
        catch (err) {
            console.log('getAllOutOrders:', err);
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
                    price: price,
                    sortOrder: the order of products
                }]
                terms: terms
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
                terms: params.terms
            });
            
            quotation = await quotation.save();
            
            //-- create details
            let quotationDetails = [];
            params.details.forEach(detail => {
                quotationDetails.push(new _app.model.QuotationDetails({
                    quotationID: quotation._id,
                    productID: detail.productID,
                    amount: detail.amount,
                    price: detail.price,
                    sortOrder: detail.sortOrder
                }).save());
            });
            
            await Promise.all(quotationDetails);
            return sysUtils.returnSuccess();
        }
        catch (err) {
            console.log('createQuotation:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    },
    
    getQuotationDetails: async function (principal, params) {
        "use strict";
        /*
            params:{
                [required] _id: id of the out order
            }
         */
        try {
            let quotation = await _app.model.Quotation.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(params._id)
                    }
                },
                {
                    $lookup: {
                        from: 'outStockOrder',
                        localField: 'outStockOrderID',
                        foreignField: '_id',
                        as: 'outStockOrderID'
                    }
                },
                {
                    $unwind: '$outStockOrderID',
                },
                {
                    $lookup: {
                        from: 'customerContact',
                        localField: 'customerContactID',
                        foreignField: '_id',
                        as: 'customerContactID'
                    }
                },
                {
                    $unwind: '$customerContactID',
                },
                {
                    $lookup: {
                        from: 'user',
                        localField: 'userID',
                        foreignField: '_id',
                        as: 'userID'
                    }
                },
                {
                    $unwind: '$userID',
                },
                {
                    $lookup: {
                        from: 'customer',
                        localField: 'customerContactID.customerID',
                        foreignField: '_id',
                        as: 'customerContactID.customerID'
                    }
                },
                {
                    $unwind: '$customerContactID.customerID',
                },
                {
                    $lookup: {
                        from: 'quotationDetails',
                        localField: '_id',
                        foreignField: 'quotationID',
                        as: 'selection'
                    }
                },
                {
                    $unwind: '$selection',
                },
                {
                    $lookup: {
                        from: 'product',
                        localField: 'selection.productID',
                        foreignField: '_id',
                        as: 'selection.productID'
                    }
                },
                {
                    $unwind: '$selection.productID',
                },
                {
                    $lookup: {
                        from: 'productBrand',
                        localField: 'selection.productID.brandID',
                        foreignField: '_id',
                        as: 'selection.productID.brandID'
                    }
                },
                {
                    $unwind: '$selection.productID.brandID',
                },
                {
                    $lookup: {
                        from: 'productType',
                        localField: 'selection.productID.typeID',
                        foreignField: '_id',
                        as: 'selection.productID.typeID'
                    }
                },
                {
                    $unwind: '$selection.productID.typeID',
                },
                {
                    $group: {
                        _id: "$_id",
                        createdAt: {$first: "$createdAt"},
                        customerContactID: {$first: "$customerContactID"},
                        outStockOrderID: {$first: "$outStockOrderID"},
                        userID: {$first: "$userID"},
                        terms: {$first: "$terms"},
                        selections: {
                            $addToSet: "$selection"
                        },
                    }
                }
            ]);
            if (!quotation || !quotation.length)
                return sysUtils.returnError(_app.errors.NOT_FOUND_ERROR);
            
            return sysUtils.returnSuccess(quotation[0]);
        }
        catch (err) {
            console.log('getQuotationDetails:', err);
            return sysUtils.returnError(_app.errors.SYSTEM_ERROR);
        }
    }
    
};
