app.controller('ChangeValueDialogController', ['$uibModalInstance', '$scope', '$http', 'options', function ($modalInstance, $scope, $http, options) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.changeValue = function () {
        $modalInstance.close({newValue: $scope.newValue});
    };
    
    $scope.init = function(){
        "use strict";
        $scope.options = options;
    };
}]);
