app.controller('ConfirmOrderDialogController', ['$scope', '$uibModalInstance', 'options', function ($scope, modalInstance, options) {
    "use strict";

    $scope.close = function () {
        modalInstance.dismiss();
    };

    $scope.init = function () {
        $scope.preSelectedStatus = options.status;
        $scope.global = options.global;
    };

    $scope.selectNewStatus = function(status){
        $scope.selectedStatus = status;
    };
    
    $scope.checkValid = function(){
        let valid =  Number($scope.preSelectedStatus) < Number($scope.selectedStatus);
        switch($scope.selectedStatus){
            case "2":
                valid = valid && !!$scope.poNumber && !!$scope.poDate;
                break;
        }
        return valid;
    };
    
    $scope.selectPODate = function(poDate){
        $scope.$apply(function(){
            $scope.poDate = poDate.date1;
        });
    };
    
    $scope.confirmStatus = function(){
        let result = {
            selectedStatus: $scope.selectedStatus,
        };
        switch($scope.selectedStatus){
            case "2":
                result.metaInfo = {
                    poNumber: $scope.poNumber,
                    poDate: $scope.poDate,
                    poPrepaid: $scope.poPrepaid,
                };
                break
        }
        modalInstance.close(result);
    };

}]);
