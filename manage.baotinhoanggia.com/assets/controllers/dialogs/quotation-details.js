app.controller('QuotationDetailsDialogController', ['$scope', '$uibModalInstance', function($scope, $modalInstance){
    "use strict";
    
    $scope.close = function(){
        $modalInstance.dismiss();
    };
    
}]);
