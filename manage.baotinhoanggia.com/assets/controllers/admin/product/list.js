app.controller('AdminProductListController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.filteredProducts = [];
    ctrl.allProducts = [];
    
    ctrl.queryProducts = function () {
        ctrl.queryFailed = false;
        ctrl.queryingProduct = true;
        ctrl.allProducts = [];
        ctrl.filteredProducts = [];
        
        let filter = [];
        if (ctrl.selectedProductType) filter.push({attr: 'typeID', value: ctrl.selectedProductType});
        if (ctrl.selectedProductBrand) filter.push({attr: 'brandID', value: ctrl.selectedProductBrand});
        if (ctrl.selectedProductSupplier) filter.push({attr: 'suppliersID', value: ctrl.selectedProductSupplier});
        
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'filter_collection',
            params:{
                collection: 'Product',
                filter: filter
            }
        }).then(
            function(response){
                ctrl.queryingProduct = false;
                if (response.data.success){
                    ctrl.allProducts = response.data.result;
                    ctrl.filterProduct();
                }
                else{
                    ctrl.queryFailed = response.data.error.errorMessage;
                }
            },
            function(){
                ctrl.queryingProduct = false;
                ctrl.queryFailed = 'Network error';
            }
        )
    };
    
    ctrl.filterProduct = function () {
        let regex = new RegExp(`.*${ctrl.productFilter ? $scope.global.utils.regexEscape(ctrl.productFilter) : ''}.*`, 'ig');
        ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
            return !!regex.exec(p.model);
        });
    };
    
    ctrl.init = function () {
        
        ctrl.groupSelector = $('#select_product_group');
        ctrl.typeSelector = $('#select_product_type');
        ctrl.brandSelector = $('#select_product_brand');
        ctrl.suppliersSelector = $('#select_product_suppliers');
        
        ctrl.groupSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_product_categories',
                        params: {
                            query: params.data.term,
                            with_count: true
                        }
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
                    data.forEach(function (group) {
                        group.id = group._id;
                        group.text = `${group.name} (${group.size})`;
                    });
                    return {
                        results: data
                    };
                }
            }
        });
        ctrl.groupSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.selectedProductGroup = e.params.data._id;
                ctrl.typeSelector.val('').trigger('change');
            });
        });
        
        ctrl.typeSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_types_from_category',
                        params: {
                            groupID: ctrl.selectedProductGroup,
                            query: params.data.term,
                            with_count: true,
                        }
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
                        type.text = `${type.name} (${type.size})`;
                    });
                    return {
                        results: data
                    };
                }
            }
        });
        ctrl.typeSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.selectedProductType = e.params.data._id;
                ctrl.queryProducts();
            });
        });
        
        ctrl.brandSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_product_brands',
                        params: {
                            query: params.data.term,
                            with_count: true
                        }
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
                    data.forEach(function (brand) {
                        brand.id = brand._id;
                        brand.text = `${brand.name} (${$scope.originNameFromCode(brand.origin)})`;
                    });
                    return {
                        results: data
                    };
                }
            }
        });
        ctrl.brandSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.selectedProductBrand = e.params.data._id;
                ctrl.queryProducts();
            });
        });
        
        ctrl.suppliersSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_suppliers',
                        params: {
                            query: params.data.term
                        }
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
                    data.forEach(function (brand) {
                        brand.id = brand._id;
                        brand.text = brand.name;
                    });
                    return {
                        results: data
                    };
                }
            }
        });
        ctrl.suppliersSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.selectedProductSupplier = e.params.data._id;
                ctrl.queryProducts();
            });
        });
    };
    
}]);
