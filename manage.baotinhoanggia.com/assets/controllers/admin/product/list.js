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
        else {
            ctrl.queryingProduct = false;
        }
    };
    
    ctrl.clearSelectedGroup = function () {
        console.log('group trigger');
        ctrl.typeSelector.val('').trigger('change');
        ctrl.groupSelector.val('').trigger('change');
        ctrl.selectedProductGroup = null;
        ctrl.selectedProductType = null;
        ctrl.queryProducts();
    };
    
    ctrl.clearSelectedType = function () {
        ctrl.typeSelector.val('').trigger('change');
        ctrl.selectedProductType = null;
        ctrl.queryProducts();
    };
    
    ctrl.clearSelectedBrand = function () {
        ctrl.brandSelector.val('').trigger('change');
        ctrl.selectedProductBrand = null;
        ctrl.queryProducts();
    };
    
    ctrl.clearSelectedSupplier = function () {
        ctrl.supplierSelector.val('').trigger('change');
        ctrl.selectedProductSupplier = null;
        ctrl.queryProducts();
    };
    
    ctrl.loadProduct = function (productID) {
        ctrl.loadingProduct = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_product',
            params: {
                _id: productID,
                full_info: true
            }
        }).then(
            function (response) {
                ctrl.loadingProduct = false;
                if (response.data.success) {
                    ctrl.product = response.data.result;
                }
                else {
                    alert(response.data.error.errorMessage);
                }
            },
            function () {
                ctrl.loadingProduct = false;
                alert('Network error');
            }
        );
    };
    
    ctrl.selectProduct = function (product) {
        ctrl.selectedProduct = product;
        //-- load product details
        ctrl.loadProduct(product._id);
    };
    
    ctrl.filterProduct = function () {
        let regex = new RegExp(`.*${ctrl.productFilter ? $scope.global.utils.regexEscape(ctrl.productFilter) : ''}.*`, 'i');
        ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
            return !!regex.exec(p.model);
        });
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
        console.log(ctrl.product);
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
        $timeout(function () {
            let values = [];
            let ids = [];
            ctrl.product.supplierIDs.forEach(function (supplier) {
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
                                value: ctrl.product.typeID._id
                            },
                            {
                                attr: 'brandID',
                                value: ctrl.product.brandID._id
                            },
                            {
                                attr: 'model',
                                value: value
                            }
                        ]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || response.data.error.errorMessage);
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
            ctrl.product.isBeingEdited = false;
            
            //-- calculate added photo counts;
            let addedPhotos = [];
            ctrl.product.photos.forEach(function (p) {
                if (p.localPhoto) addedPhotos.push(p);
            });
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'update_product',
                params: {
                    _id: ctrl.product._id,
                    model: data.model,
                    description: data.description,
                    supplierIDs: ctrl.suppliersEditSelector.val(),
                    addedPhotos: addedPhotos.length,
                }
            }).then(
                function (response) {
                    //-- upload photos
                    let updateSuccessHook = function () {
                        $timeout(function () {
                            ctrl.product = response.data.result.product;
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
                    else{
                        resolve(true);
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
                    token: $scope.global.user.token,
                    name: 'remove_product_photo',
                    params: {
                        _id: ctrl.product._id,
                        fileName: image.fileName
                    }
                }).then(
                    function (response) {
                        image.isBeingRemoved = false;
                        if (response.data.success) {
                            //-- update local model
                            ctrl.product.photos.splice(index, 1);
                        }
                        else {
                            alert(response.data.error.errorMessage);
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
    
    ctrl.init = function () {
        
        ctrl.groupSelector = $('#select_product_group');
        ctrl.typeSelector = $('#select_product_type');
        ctrl.brandSelector = $('#select_product_brand');
        ctrl.supplierSelector = $('#select_product_supplier');
        
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
                ctrl.queryProducts();
            });
        });
        
        //-- check hash
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries && queries.productID) {
            //-- load product
            ctrl.loadProduct(queries.productID);
        }
    };
    
}]);
