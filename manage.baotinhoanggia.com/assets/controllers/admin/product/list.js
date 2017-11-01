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
        ctrl.selectedProduct = null;
        
        let filter = [];
        if (ctrl.selectedProductType) filter.push({attr: 'typeID', value: ctrl.selectedProductType});
        if (ctrl.selectedProductBrand) filter.push({attr: 'brandID', value: ctrl.selectedProductBrand});
        if (ctrl.selectedProductSupplier) filter.push({attr: 'suppliersID', value: ctrl.selectedProductSupplier});
        
        //-- at least one query if not to select all products
        if (filter.length) {
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'filter_collection',
                params: {
                    collection: 'Product',
                    filter: filter
                }
            }).then(
                function (response) {
                    ctrl.queryingProduct = false;
                    if (response.data.success) {
                        ctrl.allProducts = response.data.result;
                        ctrl.filterProduct();
                    }
                    else {
                        ctrl.queryFailed = response.data.error.errorMessage;
                    }
                },
                function () {
                    ctrl.queryingProduct = false;
                    ctrl.queryFailed = 'Network error';
                }
            )
        }
        else{
            ctrl.queryingProduct = false;
        }
    };
    
    ctrl.clearSelectedGroup = function(){
        console.log('group trigger');
        ctrl.typeSelector.val('').trigger('change');
        ctrl.groupSelector.val('').trigger('change');
        ctrl.selectedProductGroup = null;
        ctrl.selectedProductType = null;
        ctrl.queryProducts();
    };
    
    ctrl.clearSelectedType = function(){
        ctrl.typeSelector.val('').trigger('change');
        ctrl.selectedProductType = null;
        ctrl.queryProducts();
    };
    
    ctrl.clearSelectedBrand = function(){
        ctrl.brandSelector.val('').trigger('change');
        ctrl.selectedProductBrand = null;
        ctrl.queryProducts();
    };
    
    ctrl.clearSelectedSupplier = function(){
        ctrl.suppliersSelector.val('').trigger('change');
        ctrl.selectedProductSupplier = null;
        ctrl.queryProducts();
    };
    
    ctrl.selectProduct = function (product) {
        ctrl.selectedProduct = product;
        //-- load product details
        ctrl.loadingProduct = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_product',
            params: {
                _id: ctrl.selectedProduct._id,
                full_info: true
            }
        }).then(
            function(response){
                ctrl.loadingProduct = false;
                if (response.data.success){
                    ctrl.product = response.data.result;
                    console.log(ctrl.product);
                }
                else{
                    alert(response.data.error.errorMessage);
                }
            },
            function(){
                ctrl.loadingProduct = false;
                alert('Network error');
            }
        );
    };
    
    ctrl.filterProduct = function () {
        let regex = new RegExp(`.*${ctrl.productFilter ? $scope.global.utils.regexEscape(ctrl.productFilter) : ''}.*`, 'i');
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
