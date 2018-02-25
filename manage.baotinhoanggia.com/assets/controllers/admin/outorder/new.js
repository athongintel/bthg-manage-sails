app.controller('AdminOutOrderNewController', ['$scope', '$uibModal', '$http', function ($scope, $modal, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.getHighestSortOrder = function(selections){
        let value = 0;
        if (selections && selections.length){
            selections.forEach(function(selection){
                if (value < selection.sortOrder) value = selection.sortOrder;
            });
        }
        return value + 1;
    };
    
    ctrl.selectCustomer = function (customer) {
        ctrl.selectedCustomer = customer;
        ctrl.customerContactDisabled = false;
    };
    
    ctrl.selectCustomerContact = function (contact) {
        ctrl.selectedCustomerContact = contact;
    };
    
    ctrl.removeProductSelection = function (selection) {
        let index = ctrl.selectedProducts.findIndex(function (s) {
            return s === selection;
        });
        if (index >= 0)
            ctrl.selectedProducts.splice(index, 1);
    };
    
    ctrl.calculateTotalOrderValue = function () {
        let sum = new BigNumber(0);
        ctrl.selectedProducts.forEach(function (selection) {
            sum = sum.add(ctrl.getSubTotal(selection));
        });
        return sum.toString();
    };
    
    ctrl.getPriceAfterAdjustment = function(selection){
        return new BigNumber(selection.price || '0').add(new BigNumber(selection.priceAdjust || '0')).toString();
    };
    
    ctrl.getSubTotal = function(selection){
        return new BigNumber(ctrl.getPriceAfterAdjustment(selection)).mul(selection.amount).toString();
    };
    
    ctrl.selectProduct = function (product, i18n_select_product_amount, i18n_stock_amount, i18n_wanted_amount, i18n_product_selected) {
        //-- check if this product is already selected
        if (!ctrl.creatingOrder) {
            if (ctrl.selectedProducts.findIndex(function (selected) {
                    // console.log(selected, product);
                    return selected.productID._id === product._id;
                }) >= 0) {
                alert(i18n_product_selected);
            }
            else {
                // console.log(ctrl.selectedBranch, product.stockSum[ctrl.selectedBranch]);
                $modal.open({
                    templateUrl: 'selectProductDialog',
                    controller: 'SelectProductDialogController',
                    resolve: {
                        options: function () {
                            return {
                                global: $scope.global,
                                oldPrice: product.price || 0,
                                stockAvailable: product.stockSum[ctrl.selectedBranch] ? product.stockSum[ctrl.selectedBranch].sum : 0,
                            };
                        }
                    }
                }).result.then(
                    function (data) {
                        ctrl.selectedProducts.push({
                            productID: product,
                            amount: data.amount,
                            stockAvailable: data.stockAvailable,
                            price: product.price || '0',
                            priceAdjust: data.priceAdjust || '0',
                            note: data.note,
                            sortOrder: ctrl.getHighestSortOrder(ctrl.selectedProducts),
                            adjustValue: data.adjustValue,
                            absoluteMode: data.absoluteMode
                        });
                    },
                    function () {
                        //-- modal dismiss, do nothing
                    }
                );
            }
        }
    };
    
    ctrl.createNewQuotation = function () {
        
        //-- add priceAdjust to price
        let details = [];
        ctrl.selectedProducts.forEach(function (product){
            details.push({
                productID: product.productID._id,
                amount: product.amount,
                price: new BigNumber(product.price).plus(product.priceAdjust || 0).toString(),
                sortOrder: product.sortOrder,
                note: product.note,
            });
        });
        // console.log('selectedProducts', ctrl.selectedProducts);
        ctrl.orderIsBeingCreated = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'create_quotation',
            params: {
                orderName: ctrl.orderName, //-- order name might change
                outStockOrderID: ctrl.orderID,
                details: details,
                customerContactID: ctrl.selectedCustomerContact,
                terms: ctrl.orderTerms
            }
        }).then(
            function (response) {
                ctrl.orderIsBeingCreated = false;
                if (response.data.success) {
                    alert($scope.global.utils.errors['SUCCESS']);
                    document.location.href = '#/admin/outorder/list?outOrderID=' + ctrl.orderID;
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                ctrl.orderIsBeingCreated = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    };
    
    ctrl.editSelection = function(selection){
        if (!ctrl.creatingOrder) {
            let cb = function(){
                $modal.open({
                    templateUrl: 'selectProductDialog',
                    controller: 'SelectProductDialogController',
                    resolve: {
                        options: function () {
                            return {
                                global: $scope.global,
                                amount: selection.amount,
                                oldPrice: selection.price,
                                stockAvailable: selection.stockAvailable,
                                note: selection.note,
                                adjustValue: selection.adjustValue || "",
                                absoluteMode: selection.absoluteMode,
                            };
                        }
                    }
                }).result.then(
                    function (data) {
                        selection.amount = data.amount;
                        selection.priceAdjust = data.priceAdjust;
                        selection.note = data.note;
                        selection.adjustValue = data.adjustValue;
                        selection.absoluteMode = data.absoluteMode;
                    },
                    function () {
                        //-- modal dismiss, do nothing
                    }
                );
            };
            
            //-- check if stockAvailable is null then fetch it
            if (selection.stockAvailable === null || selection.stockAvailable === undefined){
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'get_product',
                    params: {
                        _id: selection.productID._id,
                        full_info: true,
                        stock_info: true
                    }
                }).then(
                    function (response) {
                        if (response.data.success) {
                            selection.stockAvailable = response.data.result.stockSum[ctrl.selectedBranch]? response.data.result.stockSum[ctrl.selectedBranch].sum : null;
                        }
                        cb();
                    },
                    function(err){
                        cb();
                    }
                );
            }
            else{
                cb();
            }
        }
    };
    
    ctrl.createOrder = function (i18n_create_order_success) {
        ctrl.creatingOrder = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'create_out_order',
            params: {
                name: ctrl.orderName,
                customerID: ctrl.selectedCustomer,
                branchID: ctrl.selectedBranch
            }
        }).then(
            function (response) {
                if (response.data.success) {
                    let order = response.data.result;
                    //-- create quotation
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'create_quotation',
                        params: {
                            outStockOrderID: order._id,
                            customerContactID: ctrl.selectedCustomerContact,
                            terms: ctrl.orderTerms,
                            details: ctrl.selectedProducts.map(function (selection) {
                                return {
                                    productID: selection.productID._id,
                                    amount: selection.amount,
                                    price: ctrl.getPriceAfterAdjustment(selection),
                                    sortOrder: selection.sortOrder,
                                    note: selection.note,
                                }
                            })
                        }
                    }).then(
                        function (response) {
                            if (response.data.success) {
                                alert(i18n_create_order_success);
                                document.location.href = '#/admin/outorder/list?outOrderID=' + order._id;
                            }
                            else {
                                ctrl.creatingOrder = false;
                                alert($scope.global.utils.errors[response.data.error.errorName]);
                            }
                        },
                        function () {
                            ctrl.creatingOrder = false;
                            alert($scope.global.utils.errors['NETWORK_ERROR']);
                        }
                    );
                }
                else {
                    ctrl.creatingOrder = false;
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                ctrl.creatingOrder = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        )
    };
    
    ctrl.overrideDefaultTerms = function () {
        ctrl.overridingTerms = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'set_system_variable',
            params: {
                name: 'DEFAULT_TERMS',
                value: ctrl.orderTerms
            }
        }).then(
            function (response) {
                ctrl.overridingTerms = false;
                if (response.data.success) {
                    alert($scope.global.utils.errors['SUCCESS']);
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                ctrl.overridingTerms = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    };
    
    ctrl.init = function () {
        
        ctrl.initializing = true;
        //-- break queries
        let queries = $scope.global.utils.breakQueries(window.location.hash);
        if (queries['mode'] && queries['orderID'] && queries['quotationID']) {
            if (['edit', 'clone'].indexOf(queries['mode']) >= 0) {
                ctrl.mode = queries['mode'];
                $http.post('/batch',
                    {
                        token: $scope.global.user.token,
                        options: {},
                        commands: [
                            {
                                name: 'get_out_order_details',
                                params: {
                                    _id: queries['orderID']
                                }
                            },
                            {
                                name: 'get_quotation_details',
                                params: {
                                    _id: queries['quotationID']
                                }
                            }
                        ]
                    }
                ).then(
                    function (response) {
                        ctrl.initializing = false;
                        if (response.data.success) {
                            //ctrl.orderTerms = response.data.result.value;
                            if (!response.data.result[0].success) {
                                alert($scope.global.utils.errors[response.data.result[0].error.errorCode])
                            }
                            else if (!response.data.result[1].success) {
                                alert($scope.global.utils.errors[response.data.result[1].error.errorCode])
                            }
                            else {
                                // console.log(response.data.result);
                                switch (ctrl.mode) {
                                    case 'edit':
                                        ctrl.orderID = response.data.result[0].result._id;
                                        ctrl.orderName = response.data.result[0].result.name;
                                        ctrl.selectedBranch = $scope.global.user.branchID._id;
                                        ctrl.selectedCustomer = response.data.result[0].result.customerID._id;
                                        ctrl.selectedCustomerContact = response.data.result[1].result.customerContactID;
                                        ctrl.selectedProducts = response.data.result[1].result.selections;
                                        ctrl.orderTerms = response.data.result[1].result.terms;
                                        break;
                                    
                                    case 'clone':
                                        ctrl.selectedProducts = response.data.result[1].result.selections;
                                        ctrl.orderTerms = response.data.result[1].result.terms;
                                        ctrl.selectedBranch = $scope.global.user.branchID._id;
                                        break;
                                    
                                    default:
                                        break;
                                }
                                
                                if (ctrl.selectedProducts) {
                                    ctrl.selectedProducts.sort(function (a, b) {
                                        return a.sortOrder - b.sortOrder;
                                    });
                                }
                            }
                        }
                        else {
                            alert($scope.global.utils.errors[response.data.error.errorName]);
                        }
                    },
                    function () {
                        ctrl.initializing = false;
                        alert($scope.global.utils.errors['NETWORK_ERROR']);
                    }
                );
            }
        }
        
        if (!ctrl.mode) {
            ctrl.initializing = false;
            //-- create a new order
            ctrl.selectedBranch = $scope.global.user.branchID._id;
            ctrl.customerContactDisabled = true;
            
            ctrl.selectedCustomer = null;
            ctrl.selectedCustomerContact = null;
            ctrl.selectedProducts = [];
            
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'get_system_variable',
                params: {
                    name: 'DEFAULT_TERMS',
                }
            }).then(
                function (response) {
                    ctrl.initializing = false;
                    if (response.data.success) {
                        ctrl.orderTerms = response.data.result.value;
                    }
                    else {
                        alert($scope.global.utils.errors[response.data.error.errorName]);
                    }
                },
                function () {
                    ctrl.initializing = false;
                    alert($scope.global.utils.errors['NETWORK_ERROR']);
                }
            );
        }
    };
    
}]);
