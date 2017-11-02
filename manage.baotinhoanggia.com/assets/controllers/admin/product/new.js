app.controller('AdminProductAddController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.addingProduct = false;
    ctrl.selectedProductGroup = null;
    
    ctrl.product = {};
    
    ctrl.addProduct = function (data) {
        return new Promise(function (resolve) {
            ctrl.addingProduct = true;
            let postData = {
                token: $scope.global.user.token,
                name: 'add_product',
                params: ctrl.product,
            };
            
            postData.params.model = data.model;
            postData.params.photosNumber = ctrl.productImages ? ctrl.productImages.length : 0;
            postData.params.supplierIDs = ctrl.suppliersSelector.val();
            
            $http.post('/rpc', postData).then(
                function (response) {
                    if (response.data.success) {
                        let addSuccessHook = function () {
                            $timeout(function () {
                                ctrl.addingProduct = false;
                                //-- reset fields
                                if (ctrl.keepPage) {
                                    ctrl.product = {
                                        storeBranch: ctrl.product.storeBranch
                                    };
                                    if (!ctrl.keepGroup) ctrl.groupSelector.val('').trigger('change');
                                    if (!ctrl.keepType) {
                                        ctrl.typeSelector.val('').trigger('change');
                                    }
                                    else {
                                        ctrl.product.typeID = ctrl.typeSelector.val();
                                    }
                                    if (!ctrl.keepBrand) {
                                        ctrl.brandSelector.val('').trigger('change');
                                    }
                                    else {
                                        ctrl.product.brandID = ctrl.brandSelector.val();
                                    }
                                    ctrl.suppliersSelector.val('').trigger('change');
                                    ctrl.productImages = null;
                                    alert('Success');
                                    //-- reopen form
                                    $timeout(function () {
                                        $scope.addProductForm.$show();
                                    }, 100);
                                    resolve(true);
                                }
                                else {
                                    //-- redirect to product find
                                    document.location.href = `#/admin/product/list?productID=${response.data.result.product._id}`;
                                }
                            }, 50);
                        };
                        //-- upload photos, match url and photos
                        if (ctrl.productImages) {
                            ctrl.uploadedCount = 0;
                            ctrl.uploadingPhotos = true;
                            for (let i = 0; i < ctrl.productImages.length; i++) {
                                ctrl.productImages[i].isBeingUploaded = true;
                                $http.put(response.data.result.uploadUrls[i], ctrl.productImages[i], {
                                    headers: {
                                        "Content-Type": 'image/*'
                                    }
                                }).then(
                                    function () {
                                        "use strict";
                                        ctrl.productImages[i].isBeingUploaded = false;
                                        ctrl.productImages[i].uploadSucceeded = true;
                                        ctrl.productImages[i].uploadProceeded = true;
                                        ctrl.uploadedCount++;
                                        if (ctrl.uploadedCount === ctrl.productImages.length) {
                                            ctrl.uploadingPhotos = false;
                                            addSuccessHook();
                                        }
                                    },
                                    function () {
                                        ctrl.productImages[i].isBeingUploaded = false;
                                        ctrl.productImages[i].uploadSucceeded = false;
                                        ctrl.productImages[i].uploadProceeded = true;
                                        ctrl.uploadedCount++;
                                        if (ctrl.uploadedCount === ctrl.productImages.length) {
                                            ctrl.uploadingPhotos = false;
                                            addSuccessHook();
                                        }
                                    }
                                );
                            }
                        }
                        else {
                            addSuccessHook();
                        }
                    }
                    else {
                        ctrl.addingProduct = false;
                        alert($scope.global.utils.errors[response.data.error.errorCode]);
                        resolve($scope.global.utils.errors[response.data.error.errorCode]);
                    }
                },
                function () {
                    ctrl.addingProduct = false;
                    alert('Network error');
                    resolve('Network error')
                }
            );
            
        });
    };
    
    ctrl.checkProductAttribute = function (attr, value) {
        return new Promise(function (resolve) {
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'check_attribute',
                params: {
                    collection: 'Product',
                    pairs: [
                        {attr: 'typeID', value: ctrl.product.typeID},
                        {attr: 'brandID', value: ctrl.product.brandID},
                        {attr: attr, value: value}
                    ],
                }
            }).then(
                function (response) {
                    resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
                },
                function (err) {
                    resolve('Network error');
                }
            );
        });
    };
    
    ctrl.loadProductFiles = function (files) {
        if (!ctrl.productImages) ctrl.productImages = [];
        let left = 5 - ctrl.productImages.length;
        if (left > 0) {
            ctrl.productImages = ctrl.productImages.concat(files.slice(0, Math.min(left, files.length)));
        }
    };
    
    ctrl.removeProductImage = function (image) {
        let index = ctrl.productImages.findIndex(function (i) {
            return i === image;
        });
        if (index >= 0)
            ctrl.productImages.splice(index, 1);
    };
    
    ctrl.init = function () {
        
        ctrl.groupSelector = $('#select_product_group');
        ctrl.typeSelector = $('#select_product_type');
        ctrl.brandSelector = $('#select_product_brand');
        ctrl.suppliersSelector = $('#select_product_suppliers');
        ctrl.branchSelector = $('#select_store_branch');
        
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
                ctrl.product.typeID = null;
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
                ctrl.product.typeID = e.params.data._id;
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
                ctrl.product.brandID = e.params.data._id;
            });
        });
        
        ctrl.suppliersSelector.select2({
            multiple: true,
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
    
        //-- pre-select stock branch
        let values = [{id: $scope.global.user.branchID._id, text: $scope.global.user.branchID.name}];
        let ids = [$scope.global.user.branchID._id];
        ctrl.product.storeBranch = ids[0];
        ctrl.branchSelector.select2({
            data: values,
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_branches',
                        params: {
                            query: params.data.term,
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
                    data.forEach(function (branch) {
                        branch.id = branch._id;
                        branch.text = `${branch.name}`;
                    });
                    return {
                        results: data
                    };
                }
            }
        });
        ctrl.branchSelector.val(ids).trigger('change');
        ctrl.branchSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.product.storeBranch = e.params.data._id;
            });
        });
    };
    
}]);
