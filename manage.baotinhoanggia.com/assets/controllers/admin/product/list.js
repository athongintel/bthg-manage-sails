app.controller('AdminProductListController', ['$scope', '$http', '$timeout', '$uibModal', function ($scope, $http, $timeout, $modal) {
    "use strict";
    
    let ctrl = this;
    
    //-- shared variables
    ctrl.selectedProductId = null;
    
    ctrl.selectProduct = function(product){
        ctrl.selectedProductId = product? product._id : null;
    };
    
    ctrl.init = function () {
        
        //-- check hash
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries && queries.productID) {
            //-- load product
            ctrl.selectedProductId = queries.productID;
        }
    };
    
}]);
