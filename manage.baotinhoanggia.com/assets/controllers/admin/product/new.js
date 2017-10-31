app.controller('AdminProductAddController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.init = function () {
        
        ctrl.groupSelector = $('#select_product_group');
        ctrl.typeSelector = $('#select_product_type');
        ctrl.brandSelector = $('#select_product_brand');
        
        ctrl.groupSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_product_categories',
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
                    data.forEach(function (group) {
                        group.id = group._id;
                        group.text = group.name;
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
                ctrl.selectedProductType = null;
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
            $timeout(function () {
                ctrl.selectedProductType = e.params.data._id;
            });
        });
    
        ctrl.brandSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_product_brands',
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
        ctrl.brandSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.selectedProductBrand = e.params.data._id;
            });
        });
        
    };
    
}]);
