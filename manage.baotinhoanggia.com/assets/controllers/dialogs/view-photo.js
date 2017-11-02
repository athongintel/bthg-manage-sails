app.controller('ViewPhotoDialogController', ['$uibModalInstance', '$scope', 'options', function ($modalInstance, $scope, options) {
    $scope.options = options;
    $scope.close = function(){
        "use strict";
        $modalInstance.close();
    }
}]);
