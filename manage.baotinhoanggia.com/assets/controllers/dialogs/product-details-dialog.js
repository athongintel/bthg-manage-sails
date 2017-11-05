app.controller('ProductDetailsDialogController', ['$uibModalInstance', '$scope', 'options', function ($modalInstance, $scope, options) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.init = function(){
        "use strict";
        $scope.options = options;
    }
    
}]);
