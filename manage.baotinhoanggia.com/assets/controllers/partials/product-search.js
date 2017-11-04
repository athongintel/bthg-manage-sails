const ProductSearchPartialController = function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
    
        ctrl.refreshProducts();
        
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
                        alert(ctrl.global.utils.errors[response.data.error.errorCode]);
                    }
                },
                function(){
                    alert('Network error');
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
        if (ctrl.selectedGroup) filter.push({attr: 'typeID.groupID._id', value: ctrl.selectedGroup._id});
        if (ctrl.selectedType) filter.push({attr: 'typeID._id', value: ctrl.selectedType._id});
        if (ctrl.selectedBrand) filter.push({attr: 'brandID._id', value: ctrl.selectedBrand._id});
        
        let regex = new RegExp(`.*${ctrl.productFilter ? ctrl.global.utils.regexEscape(ctrl.productFilter) : ''}.*`, 'i');
        ctrl.filteredProducts = ctrl.allProducts.filter(function (p) {
            return !!regex.exec(p.model);
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
    
        if (ctrl.selectedSupplier) {
            ctrl.filteredProducts = ctrl.filteredProducts.filter(function (p) {
                return p.supplierIDs.findIndex(function (supp) {
                    return String(supp) === ctrl.selectedSupplier._id;
                }) >= 0;
            });
        }
    
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
            params: {}
        }).then(
            function (response) {
                ctrl.queryingProduct = false;
                if (response.data.success) {
                    ctrl.allProducts = response.data.result;
                    ctrl.filterProduct();
                }
                else {
                    ctrl.queryFailed = ctrl.global.utils.errors[response.data.error.errorCode];
                }
            },
            function () {
                ctrl.queryingProduct = false;
                ctrl.queryFailed = 'Network error';
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
