app.controller('AdminProductAddController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.addingProduct = false;
    ctrl.selectedProductGroup = null;
    ctrl.allBranches = [];
    
    ctrl.product = {};
    
    ctrl.addProduct = function (data) {
        return new Promise(function (resolve) {
            ctrl.addingProduct = true;
            let postData = {
                token: $scope.global.user.token,
                name: 'add_product',
                params: ctrl.product,
            };
            
            postData.params.stockIDs = ctrl.selectedBranches;
            postData.params.typeID = ctrl.selectedType._id;
            postData.params.brandID = ctrl.selectedBrand._id;
            postData.params.branchID = ctrl.selectedBranch._id;
            postData.params.model = data.model;
            postData.params.photosNumber = ctrl.productImages ? ctrl.productImages.length : 0;
            postData.params.supplierIDs = ctrl.selectedSuppliers.map(function (supp) {
                return supp._id;
            });
            
            $http.post('/rpc', postData).then(
                function (response) {
                    if (response.data.success) {
                        let addSuccessHook = function () {
                            $timeout(function () {
                                ctrl.addingProduct = false;
                                //-- reset fields
                                if (ctrl.keepPage) {
                                    ctrl.product = {};
                                    if (!ctrl.keepGroup && !ctrl.keepType) ctrl.selectedGroup = null;
                                    if (!ctrl.keepType) ctrl.selectedType = null;
                                    if (!ctrl.keepBrand) ctrl.selectedBrand = null;
                                    ctrl.selectedSuppliers = [];
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
                        console.log(response.data.error);
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
                        {attr: 'typeID', value: ctrl.selectedType._id},
                        {attr: 'brandID', value: ctrl.selectedBrand._id},
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
    
    ctrl.addSupplier = function (supplier) {
        ctrl.selectedSuppliers.push(supplier);
    };
    
    ctrl.removeSupplier = function (supplier) {
        let index = ctrl.selectedSuppliers.findIndex(function (supp) {
            return String(supp._id) === supplier.id;
        });
        if (index >= 0) {
            ctrl.selectedSuppliers.splice(index, 1);
        }
    };
    
    ctrl.changeGroup = function (group) {
        ctrl.selectedGroup = group;
        ctrl.selectedType = null;
    };
    
    ctrl.changeType = function (type) {
        ctrl.selectedType = type;
        if (ctrl.selectedType && (!ctrl.selectedGroup || ctrl.selectedGroup._id !== ctrl.selectedType.groupID)) {
            //-- load the corresponding group
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'get_product_category',
                params: {
                    _id: ctrl.selectedType.groupID,
                }
            }).then(
                function (response) {
                    if (response.data.success) {
                        ctrl.selectedGroup = response.data.result;
                    }
                    else {
                        alert($scope.global.utils.errors[response.data.error.errorCode]);
                        console.log(response.data.error);
                    }
                },
                function () {
                    alert('Network error');
                }
            )
        }
    };
    
    ctrl.changeBrand = function (brand) {
        ctrl.selectedBrand = brand;
    };
    
    ctrl.changeBranches = function (branches) {
        ctrl.selectedBranches = branches;
    };
    
    ctrl.init = function () {
        
        ctrl.preSelectedBranchIDs = [$scope.global.user.branchID._id];
        ctrl.selectedBranches = [$scope.global.user.branchID._id];
    
        ctrl.selectedBranch = $scope.global.user.branchID;
        ctrl.selectedGroup = null;
        ctrl.selectedType = null;
        ctrl.selectedBrand = null;
        ctrl.selectedSuppliers = [];
    };
    
}]);
