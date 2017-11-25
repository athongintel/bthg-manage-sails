app.controller('AdminProductBrandController', ['$scope', '$http', function ($scope, $http) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.brandFilter = "";
    ctrl.typeFilter = "";
    
    ctrl.filterBrand = function () {
        let regex = new RegExp(`.*${$scope.global.utils.regexEscape($scope.global.utils.removeAccent(ctrl.brandFilter))}.*`, 'i');
        ctrl.filteredBrands = ctrl.brands.filter(function (brand) {
            return !brand._id || !!regex.exec($scope.global.utils.removeAccent(brand.name));
        });
    };
    
    ctrl.selectBrand = function (brand) {
        ctrl.selectedBrand = brand;
    };
    
    ctrl.addBrand = function () {
        //-- check if empty brand exists
        let emptyBranch = ctrl.brands.find(function (b) {
            return !b._id;
        });
        
        if (!emptyBranch) {
            emptyBranch = {_id: 0};
            ctrl.brands.unshift(emptyBranch);
            ctrl.selectedBrand = emptyBranch;
            ctrl.filterBrand();
        }
    };
    
    ctrl.cancelBrand = function (brand) {
        if (!brand._id) {
            //-- remove empty branch
            ctrl.selectedBrand = null;
            let removeIndex = ctrl.brands.findIndex(function (b) {
                return !b._id;
            });
            
            if (removeIndex >= 0) ctrl.brands.splice(removeIndex, 1);
            ctrl.filterBrand();
        }
    };
    
    ctrl.removeBrand = function (brand) {
        brand.isBeingRemoved = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'remove_product_brand',
            params: {
                _id: brand._id
            }
        }).then(
            function (response) {
                brand.isBeingRemoved = false;
                if (response.data.success) {
                    //-- remove
                    let removeIndex = ctrl.brands.findIndex(function (cat) {
                        return String(cat._id) === String(brand._id);
                    });
                    if (removeIndex >= 0) ctrl.brands.splice(removeIndex, 1);
                    ctrl.filterBrand();
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                    console.log(response.data.error);
                }
            },
            function () {
                brand.isBeingRemoved = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            });
    };
    
    ctrl.updateBrand = function (data, brand) {
        return new Promise(function (resolve) {
            let postData = {
                token: $scope.global.user.token,
                params: {
                    name: data.name,
                    origin: data.origin.code ? data.origin.code : brand.origin,
                }
            };
            
            if (brand._id) {
                postData.name = "update_product_brand";
                postData.params._id = brand._id;
            }
            else {
                postData.name = "add_product_brand";
            }
            
            $http.post('/rpc', postData).then(
                function (response) {
                    if (response.data.success) {
                        
                        //-- update branch
                        let updateIndex = ctrl.brands.findIndex(function (b) {
                            return String(b._id) === String(brand._id);
                        });
                        
                        if (updateIndex >= 0) {
                            response.data.result.size = ctrl.brands[updateIndex].size;
                            ctrl.brands[updateIndex] = response.data.result;
                        }
                        ctrl.filterBrand();
                        resolve(true);
                    }
                    else {
                        resolve($scope.global.utils.errors[response.data.error.errorName]);
                    }
                },
                function (err) {
                    consle.log(err);
                    resolve(err);
                }
            );
        });
    };
    
    ctrl.checkBrandAttribute = function (attr, value, oldValue) {
        if (oldValue && oldValue === value) {
            return true;
        }
        else {
            return new Promise(function (resolve) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'check_attribute',
                    params: {
                        collection: 'ProductBrand',
                        pairs: [{
                            attr: attr,
                            value: value
                        }]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorName]);
                    },
                    function () {
                        resolve($scope.global.utils.errors['NETWORK_ERROR']);
                    }
                );
            });
        }
    };
    
    ctrl.init = function () {
        ctrl.initializing = true;
        
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_all_product_brands',
            params: {
                with_count: true
            }
        }).then(
            function (response) {
                ctrl.initializing = false;
                if (response.data.success) {
                    //-- desc sort
                    response.data.result.sort(function (a, b) {
                        return String(b._id).localeCompare(String(a._id));
                    });
                    ctrl.brands = response.data.result;
                    ctrl.filterBrand();
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName])
                }
            },
            function () {
                ctrl.initializing = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    };
    
    
}]);
