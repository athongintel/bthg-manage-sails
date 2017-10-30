app.controller('AdminProductCategoryController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.selectCategory = function (category) {
        ctrl.selectedCategory = category;
        //-- load types
        ctrl.loadingTypes = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_all_types_from_category',
            params:{
                groupID: category._id,
                with_count: true,
            }
        }).then(
            function(response){
                // console.log(response.data);
                ctrl.loadingTypes = false;
                if (response.data.success){
                    ctrl.selectedCategory.types = response.data.result;
                }
                else{
                    //-- TODO: error
                }
            },
            function(err){
                ctrl.loadingTypes = false;
                //-- TODO: error
            }
        );
    };
    
    ctrl.addCategory = function () {
        ctrl.newCategory = {
            _id: 0,
        };
        ctrl.isNewCategory = true;
        $scope.newCategoryForm.$show();
    };
    
    ctrl.cancelCategory = function () {
        ctrl.isNewCategory = false;
    };
    
    ctrl.removeCategory = function (category) {
        category.isBeingRemoved = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'remove_product_category',
            params: {
                _id: category._id
            }
        }).then(
            function (response) {
                if (response.data.success) {
                    //-- remove
                    let removeIndex = ctrl.categories.findIndex(function (cat) {
                        return String(cat._id) === String(category._id);
                    });
                    if (removeIndex >= 0) ctrl.categories.splice(removeIndex, 1);
                }
                else {
                    //-- TODO: error
                }
            },
            function (err) {
                //-- TODO: error
            });
    };
    
    ctrl.updateCategory = function (category, name) {
        if (name === "" || name === null || name === undefined) {
            if (!category._id) {
                ctrl.isNewCategory = false;
            }
            return new Promise(function (resolve) {
                resolve(false);
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                let data = {
                    token: $scope.global.user.token,
                    params: {
                        _id: category._id,
                        name: name
                    }
                };
                data.name = category._id ? "update_product_category" : "add_product_category";
                
                $http.post('/rpc', data).then(
                    function (response) {
                        if (response.data.success) {
                            let updateIndex = ctrl.categories.findIndex(function (cat) {
                                return String(cat._id) === String(response.data.result._id);
                            });
                            
                            if (updateIndex >= 0) {
                                response.data.result.size = ctrl.categories[updateIndex].size;
                                ctrl.categories[updateIndex] = response.data.result;
                            }
                            else {
                                ctrl.isNewCategory = false;
                                ctrl.categories.unshift(response.data.result);
                            }
                            resolve(true);
                        }
                        else {
                            resolve(response.data.error.errorMessage);
                        }
                    },
                    function (err) {
                        resolve(err);
                    }
                );
            });
        }
        
    };
    
    
    ctrl.selectType = function (type) {
        ctrl.selectedType = type;
    };
    
    ctrl.addType = function () {
        ctrl.newType = {
            _id: 0,
        };
        ctrl.isNewType = true;
        $scope.newTypeForm.$show();
    };
    
    ctrl.cancelType = function () {
        ctrl.isNewType = false;
    };
    
    ctrl.removeType = function (type) {
        type.isBeingRemoved = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'remove_product_type',
            params: {
                _id: type._id
            }
        }).then(
            function (response) {
                if (response.data.success) {
                    //-- remove
                    let removeIndex = ctrl.selectedCategory.types.findIndex(function (t) {
                        return String(t._id) === String(type._id);
                    });
                    if (removeIndex >= 0) ctrl.selectedCategory.types.splice(removeIndex, 1);
                    ctrl.selectedCategory.size--;
                }
                else {
                    //-- TODO: error
                }
            },
            function (err) {
                //-- TODO: error
            });
    };
    
    ctrl.updateType = function (type, name) {
        if (name === "" || name === null || name === undefined) {
            if (!type._id) {
                ctrl.isNewType = false;
            }
            return new Promise(function (resolve) {
                resolve(false);
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                let data = {
                    token: $scope.global.user.token,
                    params: {
                        _id: type._id,
                        groupID: ctrl.selectedCategory._id,
                        name: name
                    }
                };
                data.name = type._id ? "update_product_type" : "add_product_type";

                $http.post('/rpc', data).then(
                    function (response) {
                        if (response.data.success) {
                            let updateIndex = ctrl.selectedCategory.types.findIndex(function (type) {
                                return String(type._id) === String(response.data.result._id);
                            });

                            if (updateIndex >= 0) {
                                response.data.result.size = ctrl.selectedCategory.types[updateIndex].size;
                                ctrl.selectedCategory.types[updateIndex] = response.data.result;
                            }
                            else {
                                ctrl.selectedCategory.size++;
                                ctrl.isNewType = false;
                                ctrl.selectedCategory.types.unshift(response.data.result);
                            }
                            resolve(true);
                        }
                        else {
                            resolve(response.data.error.errorMessage);
                        }
                    },
                    function (err) {
                        resolve(err);
                    }
                );
            });
        }

    };
    
    
    ctrl.init = function () {
        ctrl.initializing = true;
        
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_all_product_categories',
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
                    ctrl.categories = response.data.result;
                }
                else {
                    //-- TODO: error
                }
            },
            function (err) {
                ctrl.initializing = false;
                //-- TODO: error
            }
        );
    };
    
    
}]);
