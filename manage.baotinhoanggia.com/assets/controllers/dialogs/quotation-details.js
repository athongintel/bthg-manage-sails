app.controller('QuotationDetailsDialogController', ['$scope', '$uibModalInstance', '$http', 'options', function ($scope, $modalInstance, $http, options) {
    "use strict";
    
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.calculateTotalOrderValue = function(){
        let sum = new BigNumber(0);
        $scope.quotation.selections.forEach(function(selection){
            sum = sum.add(new BigNumber(selection.price).mul(selection.amount));
        });
        return sum.toString();
    };
    
    $scope.init = function () {
        $scope.loadingQuotation = true;
        
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_quotation_details',
            params: {
                _id: options.quotationId,
            }
        }).then(
            function (response) {
                $scope.loadingQuotation = false;
                if (response.data.success){
                    $scope.quotation = response.data.result;
                    //console.log($scope.quotation);
                }
                else{
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                }
            },
            function () {
                $scope.loadingQuotation = false;
                alert('Network error');
            }
        );
    }
    
}]);
