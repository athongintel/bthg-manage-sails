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
            sum = sum.add(new BigNumber(selection.price || "0").mul(selection.amount || "0"));
        });
        return sum.toString();
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
                    templateUrl: 'changeValueDialog',
                    controller: 'ChangeValueDialogController',
                    resolve: {
                        options: function () {
                            return {
                                dialogHeader: i18n_select_product_amount,
                                oldValueHeader: i18n_stock_amount,
                                newValueHeader: i18n_wanted_amount,
                                global: $scope.global,
                                oldValue: product.stockSum[ctrl.selectedBranch] ? product.stockSum[ctrl.selectedBranch].sum : 0,
                            };
                        }
                    }
                }).result.then(
                    function (data) {
                        ctrl.selectedProducts.push({
                            productID: product,
                            amount: data.newValue,
                            price: product.lastOutStock ? product.lastOutStock.price : 0,
                            sortOrder: ctrl.getHighestSortOrder(ctrl.selectedProducts)
                        });
                        // console.log(ctrl.selectedProducts);
                    },
                    function () {
                        //-- modal dismiss, do nothing
                    }
                );
            }
        }
    };
    
    ctrl.createNewQuotation = function () {
        ctrl.orderIsBeingCreated = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'create_quotation',
            params: {
                outStockOrderID: ctrl.orderID,
                details: ctrl.selectedProducts,
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
                                    price: selection.price,
                                    sortOrder: selection.sortOrder,
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
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
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
