app.controller('ProductSearchPartialController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    const arrayRegex = new RegExp('\\[\\w*\\]', 'i');
    
    //-- @interface
    $scope.selectProduct = function (product) {
        //-- process at child level
        ctrl.selectedProduct = product;
        //-- then call parent
        $scope.$parent.selectProduct(product);
    };
    
    //-- internal functions
    ctrl.clearSelectedGroup = function () {
        ctrl.typeSelector.val('').trigger('change');
        ctrl.groupSelector.val('').trigger('change');
        ctrl.selectedProductGroup = null;
        ctrl.selectedProductType = null;
        ctrl.filterProduct();
    };
    
    ctrl.clearSelectedType = function () {
        ctrl.typeSelector.val('').trigger('change');
        ctrl.selectedProductType = null;
        ctrl.filterProduct();
    };
    
    ctrl.clearSelectedBrand = function () {
        ctrl.brandSelector.val('').trigger('change');
        ctrl.selectedProductBrand = null;
        ctrl.filterProduct();
    };
    
    ctrl.clearSelectedSupplier = function () {
        ctrl.supplierSelector.val('').trigger('change');
        ctrl.selectedProductSupplier = null;
        ctrl.filterProduct();
    };
    
    ctrl.calculateAveragePrice = function (prices) {
        let total = new BigNumber(0);
        if (prices.length) {
            prices.forEach(function (price) {
                if (price)
                    total = total.add(new BigNumber(price.price));
            });
            total = total.dividedBy(prices.length);
        }
        return total.toString();
    };
    
    ctrl.filterProduct = function () {
        let filter = [];
        if (ctrl.selectedProductGroup) filter.push({attr: 'typeID.groupID._id', value: ctrl.selectedProductGroup});
        if (ctrl.selectedProductType) filter.push({attr: 'typeID._id', value: ctrl.selectedProductType});
        if (ctrl.selectedProductBrand) filter.push({attr: 'brandID._id', value: ctrl.selectedProductBrand});
        
        let regex = new RegExp(`.*${ctrl.productFilter ? $scope.global.utils.regexEscape(ctrl.productFilter) : ''}.*`, 'i');
        ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
            return !!regex.exec(p.model);
        });
        
        ctrl.filteredProducts = ctrl.filteredProducts.filter(function (p) {
            let passed = true;
            filter.forEach(function (pair) {
                let attrPath = pair.attr.split('.');
                let value = p;
                attrPath.some(function (path) {
                    //-- check whether path is array
                    if (!value || value[path] === null || value[path] === undefined) return false;
                    value = value[path]
                });
                passed = passed && (value === pair.value);
            });
            return passed;
        });
    
        if (ctrl.selectedProductSupplier){
            ctrl.filteredProducts = ctrl.filteredProducts.filter(function (p) {
                return p.supplierIDs.findIndex(function(supp){
                    return String(supp._id) === ctrl.selectedProductSupplier;
                }) >= 0;
            });
        }
    };
    
    ctrl.refreshProducts = function () {
        ctrl.queryFailed = false;
        ctrl.queryingProduct = true;
        ctrl.allProducts = [];
        ctrl.filteredProducts = [];
        ctrl.selectedProduct = null;
        
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_all_products_with_details',
            params: {}
        }).then(
            function (response) {
                ctrl.queryingProduct = false;
                if (response.data.success) {
                    ctrl.allProducts = response.data.result;
                    ctrl.filterProduct();
                }
                else {
                    ctrl.queryFailed = $scope.global.utils.errors[response.data.error.errorCode];
                }
            },
            function () {
                ctrl.queryingProduct = false;
                ctrl.queryFailed = 'Network error';
            }
        )
    };
    
    ctrl.init = function () {
        ctrl.groupSelector = $('#partials_product-search_select-product-group');
        ctrl.typeSelector = $('#partials_product-search_select-product-type');
        ctrl.brandSelector = $('#partials_product-search_select-product-brand');
        ctrl.supplierSelector = $('#partials_product-search_select-product-supplier');
        
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
                        group.text = `${group.name} (${group.productCount})`;
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
                ctrl.filterProduct();
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
                ctrl.filterProduct();
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
                        brand.text = `${brand.name} (${$scope.global.utils.originNameFromCode(brand.origin)})`;
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
                ctrl.filterProduct();
            });
        });
        
        ctrl.supplierSelector.select2({
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
        ctrl.supplierSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.selectedProductSupplier = e.params.data._id;
                ctrl.filterProduct();
            });
        });
        
        ctrl.refreshProducts();
    }
    
}]);
