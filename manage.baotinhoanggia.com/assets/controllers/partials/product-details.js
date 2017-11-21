const ProductDetailsPartialController = function ($scope, $http, $uibModal) {
    "use strict";
    
    const ctrl = this;
    
    //-- shared variables
    ctrl.selectedGroup = {};
    ctrl.selectedType = {};
    ctrl.selectedBrand = {};
    ctrl.selectedSuppliers = {};
    
    ctrl.changeSelectedType = function (type) {
        ctrl.selectedType = type;
    };
    
    ctrl.changeSelectedBrand = function (brand) {
        ctrl.selectedBrand = brand;
    };
    
    ctrl.addSelectedSupplier = function (supplier) {
        ctrl.selectedSuppliers.push(supplier);
    };
    ctrl.removeSelectedSupplier = function (supplier) {
        let index = ctrl.selectedSuppliers.findIndex(function (supp) {
            return String(supplier.id) === supp._id;
        });
        if (index >= 0) ctrl.selectedSuppliers.splice(index, 1);
    };
    
    ctrl.calculateStockSumDisplay = function(branch, product){
        let calculateAllStocksSum = function(product){
            let sum = 0;
            if (product && product.stockSum){
                Object.keys(product.stockSum).forEach(function(key){
                    sum += product.stockSum[key].sum;
                });
            }
            return sum;
        };
        let display = '-';
        if (branch && product) {
            display = product.stockSum && product.stockSum[branch._id] ? product.stockSum[branch._id].sum : '0';
            if (ctrl.global.utils.isSuperAdmin())
                display += '/' + calculateAllStocksSum(product);
        }
        return display;
    };
    
    ctrl.changeBranches = function(branches){
        ctrl.selectedStocks = branches;
    };
    
    ctrl.loadProduct = function (productID) {
        ctrl.product = null;
        if (productID) {
            ctrl.loadingProduct = true;
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_product',
                params: {
                    _id: productID,
                    full_info: true,
                    stock_info: true,
                }
            }).then(
                function (response) {
                    ctrl.loadingProduct = false;
                    if (response.data.success) {
                        ctrl.product = response.data.result;
                        // console.log(ctrl.product);
                        ctrl.selectedGroup = ctrl.product.typeID.groupID;
                        ctrl.selectedBrand = ctrl.product.brandID;
                        ctrl.selectedType = ctrl.product.typeID;
                        ctrl.selectedSuppliers = ctrl.product.supplierIDs;
                        
                        ctrl.preSelectedBranchIDs = ctrl.product.stockIDs? ctrl.product.stockIDs.map(function(stock){ return stock._id; }) : [];
                        ctrl.selectedStocks = ctrl.product.stockIDs? ctrl.product.stockIDs.map(function(stock){ return stock._id; }) : [];
                    }
                    else {
                        alert(ctrl.global.utils.errors[response.data.error.errorName]);
                        // console.log(response.data.error);
                    }
                },
                function () {
                    ctrl.loadingProduct = false;
                    alert($scope.global.utils.errors[-1]);
                }
            );
        }
    };
    
    ctrl.$onInit = function () {
    };
    
    ctrl.$onChanges = function (objs) {
        if (objs['selectedProductId']) {
            ctrl.loadProduct(objs['selectedProductId'].currentValue);
        }
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
        let currentCount = ctrl.product.photos.length;
        let left = 5 - currentCount;
        let newPhotos = [];
        for (let i = 0; i < Math.min($files.length, left); i++) {
            newPhotos.push({
                localPhoto: true,
                file: $files[i]
            });
        }
        ctrl.product.photos = ctrl.product.photos.concat(newPhotos);
    };
    
    ctrl.viewPhoto = function (image) {
        if (!ctrl.product.isBeingRemoved) {
            $uibModal.open({
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
        }
    };
    
    
    ctrl.checkProductAttribute = function (attr, value, oldValue) {
        if (oldValue && oldValue === value) {
            return true;
        }
        else {
            return new Promise(function (resolve) {
                $http.post('/rpc', {
                    token: ctrl.global.user.token,
                    name: 'check_attribute',
                    params: {
                        collection: 'Product',
                        pairs: [
                            {
                                attr: 'typeID',
                                value: ctrl.product.typeID._id
                            },
                            {
                                attr: 'brandID',
                                value: ctrl.product.brandID._id
                            },
                            {
                                attr: attr,
                                value: value
                            }
                        ]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || ctrl.global.utils.errors[response.data.error.errorName]);
                    },
                    function (err) {
                        resolve('Network error');
                    }
                )
            });
        }
    };
    
    ctrl.removeProduct = function (i18n_confirm_remove_product) {
        let ok = confirm(i18n_confirm_remove_product);
        if (ok) {
            ctrl.cancelEditing();
            ctrl.product.isBeingEdited = false;
            ctrl.product.isBeingRemoved = true;
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'remove_product',
                params: {
                    _id: ctrl.product._id,
                }
            }).then(
                function (response) {
                    ctrl.product.isBeingRemoved = false;
                    if (response.data.success) {
                        ctrl.product = null;
                    }
                    else {
                        alert(ctrl.global.utils.errors[response.data.error.errorName]);
                        console.log(response.data.error);
                    }
                },
                function () {
                    ctrl.product.isBeingRemoved = false;
                    alert($scope.global.utils.errors[-1]);
                }
            );
        }
    };
    
    ctrl.updateProduct = function (data) {
        return new Promise(function (resolve) {
            //-- temporary disable editting
            ctrl.product.isBeingEdited = false;
            
            //-- calculate added photo counts;
            let addedPhotos = [];
            ctrl.product.photos.forEach(function (p) {
                if (p.localPhoto) addedPhotos.push(p);
            });
            
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'update_product',
                params: {
                    _id: ctrl.product._id,
                    model: data.model,
                    description: data.description,
                    typeID: ctrl.selectedType._id,
                    brandID: ctrl.selectedBrand._id,
                    stockIDs: ctrl.selectedStocks,
                    supplierIDs: ctrl.selectedSuppliers.map(function (suppiler) {
                        return suppiler._id
                    }),
                    addedPhotos: addedPhotos.length,
                }
            }).then(
                function (response) {
                    //-- upload photos
                    if (response.data.success) {
                        let updateSuccessHook = function () {
                            ctrl.product = response.data.result.product;
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
                        else{
                            updateSuccessHook();
                        }
                    }
                    else {
                        alert(ctrl.global.utils.errors[response.data.error.errorName]);
                        resolve(ctrl.global.utils.errors[response.data.error.errorName]);
                    }
                },
                function () {
                    alert($scope.global.utils.errors[-1]);
                    resolve('Network error');
                }
            );
        });
    };
    
    ctrl.removeProductImage = function (image, i18n_remove_confirm) {
        let index = ctrl.product.photos.findIndex(function (p) {
            return p === image;
        });
        
        if (image.localPhoto) {
            if (index >= 0)
                ctrl.product.photos.splice(index, 1);
        }
        else {
            let okRemove = confirm(i18n_remove_confirm);
            if (okRemove) {
                //-- post request to remove photos
                image.isBeingRemoved = true;
                $http.post('/rpc', {
                    token: ctrl.global.user.token,
                    name: 'remove_product_photos',
                    params: {
                        _id: ctrl.product._id,
                        fileNames: [image.fileName]
                    }
                }).then(
                    function (response) {
                        image.isBeingRemoved = false;
                        if (response.data.success) {
                            //-- update local model
                            ctrl.product.photos.splice(index, 1);
                        }
                        else {
                            alert(ctrl.global.utils.errors[response.data.error.errorName]);
                            console.log(response.data.error);
                        }
                    },
                    function () {
                        image.isBeingRemoved = false;
                        alert($scope.global.utils.errors[-1]);
                    }
                );
            }
        }
    };
    
    ctrl.changeExportPriceManually = function (product, i18n_change_product_price_dialog_header, i18n_old_price, i18n_new_price) {
        $uibModal.open({
            templateUrl: 'changeValueDialog',
            controller: 'ChangeValueDialogController',
            resolve: {
                options: function () {
                    return {
                        global: ctrl.global,
                        oldValue: product.lastOutStock ? product.lastOutStock.price : "",
                        dialogHeader: i18n_change_product_price_dialog_header,
                        oldValueHeader: i18n_old_price,
                        newValueHeader: i18n_new_price,
                    };
                },
            },
        }).result.then(
            function (data) {
                product.outPriceBeingChanged = true;
                $http.post('/rpc', {
                    token: ctrl.global.user.token,
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
                            alert($scope.global.utils.errors[0]);
                        }
                        else {
                            alert($scope.global.utils.errors[response.data.error.errorName]);
                            console.log(response.data.error);
                        }
                    },
                    function () {
                        product.outPriceBeingChanged = false;
                        alert($scope.global.utils.errors[-1]);
                    }
                );
            },
            function () {
                //-- modal close, do nothing
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
