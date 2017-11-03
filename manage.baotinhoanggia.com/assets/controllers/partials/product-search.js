const ProductSearchPartialController = function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
        ctrl.typeSelector = $('.partials_type-selector_selector');
        
        let initSelector = function (data, value) {
            ctrl.typeSelector.select2({
                data: data,
                ajax: {
                    transport: function (params, success, failure) {
                        $http.post('/rpc', {
                            token: ctrl.global.user.token,
                            name: 'get_all_product_types',
                            params: {query: params.data.term}
                        }).then(
                            function (response) {
                                if (response.data.success) {
                                    success(response.data.result);
                                }
                                else {
                                    failure();
                                }
                            },
                            function (err) {
                                failure();
                            }
                        );
                    },
                    processResults: function (data) {
                        data.forEach(function (type) {
                            type.id = type._id;
                            type.text = type.name;
                        });
                        
                        return {
                            results: data
                        };
                    }
                }
            });
            ctrl.typeSelector.on('select2:select', function (e) {
                $scope.$apply(function () {
                    //-- keep a local change
                    ctrl.type = e.params.data._id;
                    ctrl.onTypeChanged({selectedType: e.params.data._id});
                });
            });
            if (value){
                ctrl.typeSelector.val(value).trigger('change');
            }
        };
        
        if (ctrl.selectedType) {
            //-- ajax call to get type data
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_product_type',
                params: {_id: ctrl.selectedType}
            }).then(
                function (response) {
                    if (response.data.success) {
                        let type = response.data.result;
                        initSelector([{id: type._id, text: type.name}], ctrl.selectedType);
                    }
                    else {
                        initSelector([]);
                    }
                },
                function () {
                    initSelector([]);
                }
            );
        }
        else {
            initSelector([]);
        }
        
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.typeSelector && objs['selectedType'] && (objs['selectedType'].currentValue !== ctrl.type)) {
            ctrl.typeSelector.val(objs['selectedType'].currentValue).trigger('change');
        }
    };
};

app.component('productSearch', {
    templateUrl: 'partials/product-search',
    controller: ProductSearchPartialController,
    bindings: {
        global: '<',
        selectedType: '<',
        onTypeChanged: '&'
    }
});
//
//
// app.controller('ProductSearchPartialController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
//     "use strict";
//
//     let ctrl = this;
//
//     //-- shared variables for child components
//     ctrl.selectedBrand = null;
//
//     ctrl.changeSelectedBrand = function(brand){
//         ctrl.selectedBrand = brand;
//         ctrl.filterProduct();
//     };
//
//
//     //-- @interface
//     $scope.selectProduct = function (product) {
//         //-- process at child level
//         ctrl.selectedProduct = product;
//         //-- then call parent
//         $scope.$parent.selectProduct(product);
//     };
//
//     //-- internal functions
//     ctrl.clearSelectedGroup = function () {
//         $scope.selectedProductGroup = null;
//         $scope.selectedProductType = null;
//         ctrl.filterProduct();
//     };
//
//     ctrl.clearSelectedType = function () {
//         $scope.selectedProductType = null;
//         ctrl.filterProduct();
//     };
//
//     ctrl.clearSelectedBrand = function () {
//         ctrl.selectedBrand = null;
//         ctrl.filterProduct();
//     };
//
//     ctrl.clearSelectedSupplier = function () {
//         ctrl.supplierSelector.val('').trigger('change');
//         ctrl.selectedProductSupplier = null;
//         ctrl.filterProduct();
//     };
//
//     ctrl.filterProduct = function () {
//         let filter = [];
//         if ($scope.selectedProductGroup) filter.push({attr: 'typeID.groupID._id', value: $scope.selectedProductGroup});
//         if ($scope.selectedProductType) filter.push({attr: 'typeID._id', value: $scope.selectedProductType});
//         if (ctrl.selectedBrand) filter.push({attr: 'brandID._id', value: ctrl.selectedBrand});
//
//         let regex = new RegExp(`.*${ctrl.productFilter ? $scope.global.utils.regexEscape(ctrl.productFilter) : ''}.*`, 'i');
//         ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
//             return !!regex.exec(p.model);
//         });
//
//         ctrl.filteredProducts = ctrl.filteredProducts.filter(function (p) {
//             let passed = true;
//             filter.forEach(function (pair) {
//                 let attrPath = pair.attr.split('.');
//                 let value = p;
//                 attrPath.some(function (path) {
//                     //-- check whether path is array
//                     if (!value || value[path] === null || value[path] === undefined) return false;
//                     value = value[path]
//                 });
//                 passed = passed && (value === pair.value);
//             });
//             return passed;
//         });
//
//         if (ctrl.selectedProductSupplier){
//             ctrl.filteredProducts = ctrl.filteredProducts.filter(function (p) {
//                 return p.supplierIDs.findIndex(function(supp){
//                     return String(supp) === ctrl.selectedProductSupplier;
//                 }) >= 0;
//             });
//         }
//     };
//
//     ctrl.refreshProducts = function () {
//         ctrl.queryFailed = false;
//         ctrl.queryingProduct = true;
//         ctrl.allProducts = [];
//         ctrl.filteredProducts = [];
//         ctrl.selectedProduct = null;
//
//         $http.post('/rpc', {
//             token: $scope.global.user.token,
//             name: 'get_all_products_with_details',
//             params: {}
//         }).then(
//             function (response) {
//                 ctrl.queryingProduct = false;
//                 if (response.data.success) {
//                     ctrl.allProducts = response.data.result;
//                     ctrl.filterProduct();
//                 }
//                 else {
//                     ctrl.queryFailed = $scope.global.utils.errors[response.data.error.errorCode];
//                 }
//             },
//             function () {
//                 ctrl.queryingProduct = false;
//                 ctrl.queryFailed = 'Network error';
//             }
//         )
//     };
//
//     ctrl.init = function () {
//         ctrl.supplierSelector = $('#partials_product-search_select-product-supplier');
//
//         ctrl.supplierSelector.select2({
//             ajax: {
//                 transport: function (params, success, failure) {
//                     $http.post('/rpc', {
//                         token: $scope.global.user.token,
//                         name: 'get_all_suppliers',
//                         params: {
//                             query: params.data.term
//                         }
//                     }).then(
//                         function (response) {
//                             if (response.data.success) {
//                                 success(response.data.result);
//                             }
//                             else {
//                                 failure();
//                             }
//                         },
//                         function (err) {
//                             failure();
//                         }
//                     );
//                 },
//                 processResults: function (data) {
//                     data.forEach(function (brand) {
//                         brand.id = brand._id;
//                         brand.text = brand.name;
//                     });
//                     return {
//                         results: data
//                     };
//                 }
//             }
//         });
//         ctrl.supplierSelector.on('select2:select', function (e) {
//             $timeout(function () {
//                 ctrl.selectedProductSupplier = e.params.data._id;
//                 ctrl.filterProduct();
//             });
//         });
//
//         ctrl.refreshProducts();
//     }
//
// }]);
