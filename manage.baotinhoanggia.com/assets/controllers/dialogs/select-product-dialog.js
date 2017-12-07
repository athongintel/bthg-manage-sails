app.controller('SelectProductDialogController', ['$uibModalInstance', '$scope', '$http', 'options', function ($modalInstance, $scope, $http, options) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.selectProduct = function () {
        $modalInstance.close({amount: $scope.amount, priceAdjust: $scope.priceAdjust, note: $scope.note});
    };
    
    $scope.getAdjustedPrice = function(){
        "use strict";
        return new BigNumber(options.oldPrice || 0).mul(Number(100) + Number($scope.priceAdjust || 0)).div(100).toString();
    };
    
    $scope.init = function(){
        "use strict";
        $scope.options = options;
    };
}]);
