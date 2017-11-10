app.controller('AdminOutOrderNewController', ['$scope', '$uibModal', '$http', function($scope, $modal, $http){
    "use strict";
    
    const ctrl = this;
    
    ctrl.selectCustomer = function(customer){
        ctrl.selectedCustomer = customer;
        ctrl.customerContactDisabled = false;
    };
    
    ctrl.selectCustomerContact = function(contact){
        ctrl.selectedCustomerContact = contact;
    };
    
    ctrl.removeProductSelection = function(selection){
        let index = ctrl.selectedProducts.findIndex(function(s){ return s === selection; });
        if (index >= 0)
            ctrl.selectedProducts.splice(index, 1);
    };
    
    ctrl.calculateTotalOrderValue = function(){
        let sum = new BigNumber(0);
        ctrl.selectedProducts.forEach(function(selection){
            sum = sum.add(new BigNumber(selection.sellingPrice).mul(selection.amount));
        });
        return sum.toString();
    };
    
    ctrl.selectProduct = function(product, i18n_select_product_amount, i18n_stock_amount, i18n_wanted_amount, i18n_product_selected){
        //-- check if this product is already selected
        if (!ctrl.creatingOrder) {
            if (ctrl.selectedProducts.findIndex(function (selected) {
                    return selected.product._id === product._id;
                }) >= 0)
                alert(i18n_product_selected);
            else
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
                                oldValue: product.stockSum[ctrl.selectedBranch._id].sum,
                            };
                        }
                    }
                }).result.then(
                    function (data) {
                        ctrl.selectedProducts.push({
                            product: product,
                            amount: data.newValue,
                            sellingPrice: product.lastOutStock ? product.lastOutStock.price : 0
                        });
                    },
                    function () {
                        //-- modal dismiss, do nothing
                    }
                );
        }
    };
    
    ctrl.createOrder = function(i18n_create_order_success){
        ctrl.creatingOrder = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'create_out_order',
            params:{
                name: ctrl.orderName,
                customerID: ctrl.selectedCustomer._id,
                branchID: ctrl.selectedBranch._id
            }
        }).then(
            function(response){
                if (response.data.success){
                    let order = response.data.result;
                    //-- create quotation
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'create_quotation',
                        params: {
                            outStockOrderID: order._id,
                            customerContactID: ctrl.selectedCustomerContact._id,
                            terms: ctrl.orderTerms,
                            details: ctrl.selectedProducts.map(function(selection){
                                return {
                                    productID: selection.product._id,
                                    amount: selection.amount,
                                    price: selection.sellingPrice
                                }
                            })
                        }
                    }).then(
                        function(response){
                            if (response.data.success){
                                alert(i18n_create_order_success);
                                document.location.href='#/admin/outorder/list?outOrderID=' + order._id;
                            }
                            else{
                                ctrl.creatingOrder = false;
                                alert($scope.global.utils.errors[response.data.error.errorCode]);
                            }
                        },
                        function(){
                            ctrl.creatingOrder = false;
                            alert('Network error');
                        }
                    );
                }
                else{
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                }
            },
            function(){
                alert('Network error');
            }
        )
    };
    
    ctrl.init = function(){
        
        ctrl.initializing = true;
        
        ctrl.selectedBranch = $scope.global.user.branchID;
        ctrl.disableBranch = true;
        ctrl.customerContactDisabled = true;
        
        ctrl.selectedCustomer = null;
        ctrl.selectedCustomerContact = null;
        ctrl.selectedProducts = [];
        
        $http.post('/rpc',
            {
                token: $scope.global.user.token,
                name: 'get_default_terms',
                params: {}
            }
        ).then(
            function(response){
                ctrl.initializing = false;
                if (response.data.success){
                    ctrl.orderTerms = response.data.result;
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                }
            },
            function(){
                ctrl.initializing = false;
                alert('Network error');
            }
        )
        
    };
    
}]);
