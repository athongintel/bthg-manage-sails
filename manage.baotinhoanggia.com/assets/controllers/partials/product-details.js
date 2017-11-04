const ProductDetailsPartialController = function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    //-- shared variables
    ctrl.selectedType = null;
    ctrl.selectedBrand = null;
    ctrl.selectedSuppliers = null;
    
    ctrl.loadProduct = function (productID) {
        if (!productID){
            ctrl.product = null;
        }
        else {
            ctrl.loadingProduct = true;
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_product',
                params: {
                    _id: productID,
                    full_info: true
                }
            }).then(
                function (response) {
                    ctrl.loadingProduct = false;
                    if (response.data.success) {
                        ctrl.product = response.data.result;
                        ctrl.selectedBrand = ctrl.product.brandID;
                        ctrl.selectedType = ctrl.product.typeID;
                        ctrl.selectedSuppliers = ctrl.product.supplierIDs;
                    }
                    else {
                        alert($scope.global.utils.errors[response.data.error.errorCode]);
                    }
                },
                function () {
                    ctrl.loadingProduct = false;
                    alert('Network error');
                }
            );
        }
    };
    
    ctrl.$onInit = function () {
        if (ctrl.selectedProductId){
            ctrl.loadProduct(ctrl.selectedProductId);
        }
    };
    
    ctrl.$onChanges = function (objs) {
        if (objs['selectedProductId']){
            ctrl.loadProduct(objs['selectedProductId'].currentValue);
        }
    };
    
    ctrl.changeExportPriceManually = function (product, i18n_change_product_price_dialog_header) {
        $modal.open({
            templateUrl: 'changeValueDialog',
            controller: 'ChangeValueDialogController',
            resolve: {
                options: function () {
                    return {
                        oldValue: product.lastOutStock ? product.lastOutStock.price : "",
                        dialogHeader: i18n_change_product_price_dialog_header
                    };
                },
            },
            scope: $scope
        }).result.then(
            function (data) {
                product.outPriceBeingChanged = true;
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'change_product_price_manually',
                    params: {
                        _id: product._id,
                        price: data.newValue,
                    }
                }).then(
                    function (response) {
                        product.outPriceBeingChanged = false;
                        if (response.data.success) {
                            product.lastOutStock = response.data.result;
                            alert('Success');
                        }
                        else {
                            alert($scope.global.utils.errors[response.data.error.errorCode]);
                        }
                    },
                    function () {
                        product.outPriceBeingChanged = false;
                        alert('Network error');
                    }
                );
            },
            function () {
            }
        );
    };
    
    ctrl.cancelEditing = function () {
        $scope.editProductForm.$cancel();
        ctrl.product.isBeingEdited = false;
        for (let i = ctrl.product.photos.length - 1; i > 0; i--) {
            if (ctrl.product.photos[i].localPhoto) ctrl.product.photos.splice(i, 1);
        }
    };
    
    ctrl.startEditing = function () {
        
        $scope.editProductForm.$show();
        ctrl.product.isBeingEdited = true;
        
        // let values = [];
        // let ids = [];
        // $scope.product.supplierIDs.forEach(function (supplier) {
        //     ids.push(supplier._id);
        //     values.push({id: supplier._id, text: supplier.name});
        // });
        // ctrl.suppliersEditSelector = $('#select_product_suppliers');
        // ctrl.suppliersEditSelector.select2({
        //     data: values,
        //     multiple: true,
        //     ajax: {
        //         transport: function (params, success, failure) {
        //             $http.post('/rpc', {
        //                 token: $scope.global.user.token,
        //                 name: 'get_all_suppliers',
        //                 params: {
        //                     query: params.data.term
        //                 }
        //             }).then(
        //                 function (response) {
        //                     if (response.data.success) {
        //                         success(response.data.result);
        //                     }
        //                     else {
        //                         failure();
        //                     }
        //                 },
        //                 function (err) {
        //                     failure();
        //                 }
        //             );
        //         },
        //         processResults: function (data) {
        //             data.forEach(function (supplier) {
        //                 supplier.id = supplier._id;
        //                 supplier.text = supplier.name;
        //             });
        //             return {
        //                 results: data
        //             };
        //         }
        //     }
        // });
        // ctrl.suppliersEditSelector.val(ids).trigger('change');
        
    };
};

app.component('productDetails', {
    templateUrl: 'partials/product-details',
    controller: ProductDetailsPartialController,
    bindings: {
        global: '<',
        selectedProductId: '<',
    }
});
