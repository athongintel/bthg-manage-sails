app.controller('AdminProductListController', ['$scope', '$http', '$timeout', '$uibModal', function ($scope, $http, $timeout, $modal) {
    "use strict";
    
    let ctrl = this;
    
    //-- @implement product-search.selectProduct
    $scope.selectProduct = function (product) {
        $scope.loadProduct(product._id);
    };
    
    ctrl.filteredProducts = [];
    ctrl.allProducts = [];
    
    ctrl.viewPhoto = function (image) {
        $modal.open({
            templateUrl: 'viewPhotoDialog',
            controller: 'ViewPhotoDialogController',
            resolve: {
                options: function () {
                    return {photoUrl: image.url};
                }
            }
        }).result.then(function () {
        }, function () {
        });
    };
    
    $scope.loadProduct = function (productID) {
        $scope.loadingProduct = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_product',
            params: {
                _id: productID,
                full_info: true
            }
        }).then(
            function (response) {
                $scope.loadingProduct = false;
                if (response.data.success) {
                    $scope.product = response.data.result;
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                }
            },
            function () {
                $scope.loadingProduct = false;
                alert('Network error');
            }
        );
    };
    
    ctrl.init = function () {
        
        //-- check hash
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries && queries.productID) {
            //-- load product
            ctrl.loadProduct(queries.productID);
        }
    };
    
}]);

app.controller('AdminProductListDetailsController', ['$scope', '$http', '$timeout', '$uibModal', function ($scope, $http, $timeout, $modal) {
    "use strict";
    
    const ctrl = this;
    
    //-- shared variables
    ctrl.selectedBrand = null;
    
    ctrl.changeSelectedBrand = function(brand){
        ctrl.selectedBrand = brand;
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
    
    ctrl.addProductPhoto = function ($files) {
        let currentCount = $scope.product.photos.length;
        let left = 5 - currentCount;
        let newPhotos = [];
        for (let i = 0; i < Math.min($files.length, left); i++) {
            newPhotos.push({
                localPhoto: true,
                file: $files[i]
            });
        }
        $scope.product.photos = $scope.product.photos.concat(newPhotos);
    };
    
    ctrl.checkProductAttribute = function (attr, value, oldValue) {
        if (oldValue && oldValue === value) {
            return true;
        }
        else {
            return new Promise(function (resolve) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'check_attribute',
                    params: {
                        collection: 'Product',
                        pairs: [
                            {
                                attr: 'typeID',
                                value: $scope.product.typeID._id
                            },
                            {
                                attr: 'brandID',
                                value: $scope.product.brandID._id
                            },
                            {
                                attr: 'model',
                                value: value
                            }
                        ]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
                    },
                    function (err) {
                        resolve('Network error');
                    }
                )
            });
        }
    };
    
    ctrl.updateProduct = function (data) {
        return new Promise(function (resolve) {
            //-- temporary disable editting
            $scope.product.isBeingEdited = false;
            
            //-- calculate added photo counts;
            let addedPhotos = [];
            $scope.product.photos.forEach(function (p) {
                if (p.localPhoto) addedPhotos.push(p);
            });
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'update_product',
                params: {
                    _id: $scope.product._id,
                    model: data.model,
                    description: data.description,
                    brandID: ctrl.brandEditSelector.val(),
                    supplierIDs: ctrl.suppliersEditSelector.val(),
                    addedPhotos: addedPhotos.length,
                }
            }).then(
                function (response) {
                    //-- upload photos
                    let updateSuccessHook = function () {
                        $timeout(function () {
                            //-- change the parent product, so we don't create any local product object
                            $scope.$parent.product = response.data.result.product;
                        }, 50);
                        resolve(true);
                    };
                    //-- upload photos, match url and photos
                    if (addedPhotos.length) {
                        ctrl.uploadedCount = 0;
                        ctrl.uploadingPhotos = true;
                        for (let i = 0; i < addedPhotos.length; i++) {
                            addedPhotos[i].isBeingUploaded = true;
                            $http.put(response.data.result.uploadUrls[i], addedPhotos[i].file, {
                                headers: {
                                    "Content-Type": 'image/*'
                                }
                            }).then(
                                function () {
                                    "use strict";
                                    addedPhotos[i].isBeingUploaded = false;
                                    addedPhotos[i].uploadSucceeded = true;
                                    addedPhotos[i].uploadProceeded = true;
                                    ctrl.uploadedCount++;
                                    if (ctrl.uploadedCount === addedPhotos.length) {
                                        ctrl.uploadingPhotos = false;
                                        updateSuccessHook();
                                    }
                                },
                                function () {
                                    addedPhotos[i].isBeingUploaded = false;
                                    addedPhotos[i].uploadSucceeded = false;
                                    addedPhotos[i].uploadProceeded = true;
                                    ctrl.uploadedCount++;
                                    if (ctrl.uploadedCount === addedPhotos.length) {
                                        ctrl.uploadingPhotos = false;
                                        updateSuccessHook();
                                    }
                                }
                            );
                        }
                    }
                    else {
                        updateSuccessHook();
                    }
                },
                function () {
                    alert('Network error');
                    resolve('Network error');
                }
            );
        });
    };
    
    ctrl.removeProductImage = function (image, i18n_remove_confirm) {
        let index = $scope.product.photos.findIndex(function (p) {
            return p === image;
        });
        
        if (image.localPhoto) {
            if (index >= 0)
                $scope.product.photos.splice(index, 1);
        }
        else {
            let okRemove = confirm(i18n_remove_confirm);
            if (okRemove) {
                //-- post request to remove photos
                image.isBeingRemoved = true;
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'remove_product_photo',
                    params: {
                        _id: $scope.product._id,
                        fileName: image.fileName
                    }
                }).then(
                    function (response) {
                        image.isBeingRemoved = false;
                        if (response.data.success) {
                            //-- update local model
                            $scope.product.photos.splice(index, 1);
                        }
                        else {
                            alert($scope.global.utils.errors[response.data.error.errorCode]);
                        }
                    },
                    function () {
                        image.isBeingRemoved = false;
                        alert('Network error');
                    }
                );
            }
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
        $scope.product.isBeingEdited = false;
        for (let i = $scope.product.photos.length - 1; i > 0; i--) {
            if ($scope.product.photos[i].localPhoto) $scope.product.photos.splice(i, 1);
        }
    };
    
    ctrl.startEditing = function () {
        ctrl.selectedBrand = $scope.product.brandID._id;
        
        //console.log($scope.product);
        
        $scope.editProductForm.$show();
        $scope.product.isBeingEdited = true;
        $timeout(function () {
            let values = [];
            let ids = [];
            $scope.product.supplierIDs.forEach(function (supplier) {
                ids.push(supplier._id);
                values.push({id: supplier._id, text: supplier.name});
            });
            ctrl.suppliersEditSelector = $('#select_product_suppliers');
            ctrl.suppliersEditSelector.select2({
                data: values,
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
                        data.forEach(function (supplier) {
                            supplier.id = supplier._id;
                            supplier.text = supplier.name;
                        });
                        return {
                            results: data
                        };
                    }
                }
            });
            ctrl.suppliersEditSelector.val(ids).trigger('change');
            
        });
    };
    
}]);
