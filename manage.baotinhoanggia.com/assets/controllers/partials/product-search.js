const ProductSearchPartialController = function ($scope, $http, $uibModal) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
        ctrl.selectedBranch = ctrl.global.user.branchID._id;
        ctrl.selectedGroup = {};
        ctrl.selectedType = {};
        ctrl.selectedSupplier = {};
        
        ctrl.refreshProducts();
    };
    
    ctrl.changeBranch = function(branch){
        ctrl.selectedBranch = branch;
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
        let display = product.stockSum && product.stockSum[branch]? product.stockSum[branch].sum : '0';
        if (ctrl.global.utils.isSuperAdmin())
            display += '/' + calculateAllStocksSum(product);
        return display;
    };
    
    ctrl.changeSelectedType = function(type){
        ctrl.selectedType = type;
        if (ctrl.selectedType && (!ctrl.selectedGroup || ctrl.selectedGroup._id !== ctrl.selectedType.groupID)){
            //-- load the corresponding group
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_product_category',
                params: {
                    _id: ctrl.selectedType.groupID,
                }
            }).then(
                function(response){
                    if (response.data.success){
                        ctrl.selectedGroup = response.data.result;
                    }
                    else{
                        alert(ctrl.global.utils.errors[response.data.error.errorName]);
                        // console.log(repsonse.data.error);
                    }
                },
                function(){
                    alert($scope.global.utils.errors['NETWORK_ERROR']);
                }
            )
        }
        ctrl.filterProduct();
    };
    
    ctrl.changeSelectedBrand = function(brand){
        ctrl.selectedBrand = brand;
        ctrl.filterProduct();
    };
    
    ctrl.changeSelectedGroup = function(group){
        ctrl.selectedGroup = group;
        ctrl.selectedType = null;
        ctrl.filterProduct();
    };
    
    ctrl.changeSelectedSupplier = function(group){
        ctrl.selectedSupplier = group;
        ctrl.filterProduct();
    };
    
    ctrl.filterProduct = function () {
        let filter = [];
        ctrl.filteredProducts = [];
        
        if (ctrl.selectedGroup && ctrl.selectedGroup._id) filter.push({attr: 'typeID.groupID._id', value: ctrl.selectedGroup._id});
        if (ctrl.selectedType && ctrl.selectedType._id) filter.push({attr: 'typeID._id', value: ctrl.selectedType._id});
        if (ctrl.selectedBrand && ctrl.selectedBrand._id) filter.push({attr: 'brandID._id', value: ctrl.selectedBrand._id});
        
        if (filter.length || ctrl.productFilter || (ctrl.selectedSupplier && ctrl.selectedSupplier._id)) {
    
            let regex = new RegExp(`.*${ctrl.productFilter ? ctrl.global.utils.regexEscape(ctrl.global.utils.removeAccent(ctrl.productFilter)) : ''}.*`, 'i');
            ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
                return !!regex.exec(ctrl.global.utils.removeAccent(p.model));
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
    
            if (ctrl.selectedSupplier && ctrl.selectedSupplier._id) {
                ctrl.filteredProducts = ctrl.filteredProducts.filter(function (p) {
                    return p.supplierIDs.findIndex(function (supp) {
                        return String(supp) === ctrl.selectedSupplier._id;
                    }) >= 0;
                });
            }
        }
    };
    
    ctrl.showProductDetails = function(product){
        $uibModal.open({
            templateUrl:'productDetailsDialog',
            controller:'ProductDetailsDialogController',
            resolve: {
                options: function(){
                    return {
                        global: ctrl.global,
                        productID: product._id
                    };
                }
            },
        }).result.then(
            function(){},
            function(){}
        );
    };
    
    ctrl.refreshProducts = function () {
        ctrl.queryFailed = false;
        ctrl.queryingProduct = true;
        ctrl.allProducts = [];
        ctrl.filteredProducts = [];
        ctrl.selectedProduct = null;
        
        $http.post('/rpc', {
            token: ctrl.global.user.token,
            name: 'get_all_products_with_details',
            params: {
                stock_info: true
            }
        }).then(
            function (response) {
                ctrl.queryingProduct = false;
                if (response.data.success) {
                    ctrl.allProducts = response.data.result;
                    // console.log(ctrl.allProducts);
                    ctrl.filterProduct();
                }
                else {
                    ctrl.queryFailed = ctrl.global.utils.errors[response.data.error.errorName];
                }
            },
            function () {
                ctrl.queryingProduct = false;
                ctrl.queryFailed = $scope.global.utils.errors['NETWORK_ERROR'];
            }
        )
    };
    
    ctrl.selectProduct = function(product){
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
