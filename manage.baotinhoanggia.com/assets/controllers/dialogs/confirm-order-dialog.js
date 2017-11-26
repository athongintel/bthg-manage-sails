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
    
    $scope.isEquals = function(){
        return String($scope.preSelectedStatus) === String($scope.selectedStatus);
    };
    
    $scope.confirmStatus = function(){
        modalInstance.close({selectedStatus: $scope.selectedStatus});
    };

}]);
