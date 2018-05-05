const ProductSearchPartialController = function ($scope, $http, $uibModal) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
        ctrl.selectedBranch = ctrl.global.user.branchID._id;
        ctrl.selectedGroup = {};
        ctrl.selectedType = {};
        ctrl.selectedSupplier = {};
        
    };
    
    ctrl.changeBranch = function (branch) {
        ctrl.selectedBranch = branch._id;
    };
    
    ctrl.calculateStockSumDisplay = function (branch, product) {
        let calculateAllStocksSum = function (product) {
            let sum = 0;
            if (product && product.stockSum) {
                Object.keys(product.stockSum).forEach(function (key) {
                    sum += product.stockSum[key].sum;
                });
            }
            return sum;
        };
        let display = product.stockSum && product.stockSum[branch] ? product.stockSum[branch].sum : '0';
        if (ctrl.global.utils.isSuperAdmin())
            display += '/' + calculateAllStocksSum(product);
        return display;
    };
    
    ctrl.changeSelectedType = function (type) {
        ctrl.selectedType = type;
        if (ctrl.selectedType && (!ctrl.selectedGroup || ctrl.selectedGroup._id !== ctrl.selectedType.groupID)) {
            //-- load the corresponding group
            $http.post('/rpc', {
                token: ctrl.global.user.token,
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
                        alert(ctrl.global.utils.errors[response.data.error.errorName]);
                    }
                },
                function () {
                    alert($scope.global.utils.errors['NETWORK_ERROR']);
                }
            )
        }
        ctrl.filterProduct();
    };
    
    ctrl.changeSelectedBrand = function (brand) {
        ctrl.selectedBrand = brand;
        ctrl.filterProduct();
    };
    
    ctrl.changeSelectedGroup = function (group) {
        ctrl.selectedGroup = group;
        ctrl.selectedType = null;
        ctrl.filterProduct();
    };
    
    ctrl.changeSelectedSupplier = function (group) {
        ctrl.selectedSupplier = group;
        ctrl.filterProduct();
    };
    
    ctrl.filterByModel = function () {
        let regex = new RegExp(`.*${ctrl.productFilter ? ctrl.global.utils.regexEscape(ctrl.global.utils.removeAccent(ctrl.productFilter)) : ''}.*`, 'i');
        if (ctrl.allProducts) {
            ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
                // console.log(ctrl.global.utils.removeAccent(p.model));
                return !!regex.exec(ctrl.global.utils.removeAccent(p.model));
            });
            ctrl.filteredProducts.sort(function (product1, product2) {
                return (product1.typeID.name + product1.model) < (product2.typeID.name + product2.model) ? -1 : 1;
            });
        }
    };
    
    ctrl.filterProduct = function () {
        let filter = [];
        ctrl.filteredProducts = [];
        
        if (ctrl.selectedGroup && ctrl.selectedGroup._id) filter.push({
            attr: 'typeID.groupID._id',
            value: ctrl.selectedGroup._id
        });
        if (ctrl.selectedType && ctrl.selectedType._id) filter.push({attr: 'typeID._id', value: ctrl.selectedType._id});
        if (ctrl.selectedBrand && ctrl.selectedBrand._id) filter.push({
            attr: 'brandID._id',
            value: ctrl.selectedBrand._id
        });
        if (ctrl.selectedSupplier && ctrl.selectedSupplier._id) filter.push({
            attr: 'supplierIDs',
            value: ctrl.selectedSupplier._id
        });
        
        if (filter.length || ctrl.productFilter) {
            
            //-- call ajax
            ctrl.queryingProduct = true;
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_all_products_with_details',
                params: {
                    filter: filter,
                    stock_info: true
                }
            }).then(
                function (response) {
                    ctrl.queryingProduct = false;
                    if (response.data.success) {
                        ctrl.allProducts = response.data.result;
                        ctrl.filterByModel();
                    }
                    else {
                        ctrl.queryFailed = ctrl.global.utils.errors[response.data.error.errorName];
                    }
                },
                function () {
                    ctrl.queryingProduct = false;
                    ctrl.queryFailed = $scope.global.utils.errors['NETWORK_ERROR'];
                }
            );
        }
    };
    
    ctrl.showProductDetails = function (product) {
        $uibModal.open({
            templateUrl: 'productDetailsDialog',
            controller: 'ProductDetailsDialogController',
            resolve: {
                options: function () {
                    return {
                        global: ctrl.global,
                        productID: product._id
                    };
                }
            },
        }).result.then(
            function () {
            },
            function () {
            }
        );
    };
    
    ctrl.selectProduct = function (product) {
        ctrl.selectedProduct = product;
        ctrl.onProductSelected({selectedProduct: product});
    }
};

app.component('productSearch', {
    templateUrl: 'partials/product-search',
    controller: ProductSearchPartialController,
    bindings: {
        global: '<',
        onProductSelected: '&'
    }
});
