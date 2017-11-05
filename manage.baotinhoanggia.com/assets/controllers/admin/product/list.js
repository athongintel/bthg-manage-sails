app.controller('AdminProductListController', ['$scope', '$http', '$timeout', '$uibModal', function ($scope, $http, $timeout, $modal) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.init = function () {
        
        //-- check hash
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries && queries.productID) {
            //-- load product
            $modal.open({
                templateUrl:'productDetailsDialog',
                controller:'ProductDetailsDialogController',
                resolve: {
                    options: function(){
                        return {
                            global: $scope.global,
                            productID: queries.productID
                        };
                    }
                },
            }).result.then(
                function(){},
                function(){}
            );
        }
    };
    
}]);
