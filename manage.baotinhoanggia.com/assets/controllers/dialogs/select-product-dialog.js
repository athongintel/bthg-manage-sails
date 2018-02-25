app.controller('SelectProductDialogController', ['$uibModalInstance', '$scope', '$http', 'options', function ($modalInstance, $scope, $http, options) {
    
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.selectProduct = function () {
        $modalInstance.close({amount: $scope.amount, priceAdjust: $scope.priceAdjust || 0, note: $scope.note, stockAvailable: options.stockAvailable, adjustValue: $scope.adjustValue, absoluteMode: $scope.absoluteMode});
    };
    
    $scope.getAdjustedPrice = function () {
        "use strict";
        return new BigNumber(options.oldPrice || 0).add(new BigNumber($scope.priceAdjust || "0")).toString();
    };
    
    $scope.adjustPrice = function () {
        "use strict";
        if ($scope.adjustValue !== '-') {
            if ($scope.absoluteMode) {
                $scope.priceAdjust = $scope.adjustValue || "0";
                // console.log($scope.adjustValue, $scope.priceAdjust);
            }
            else {
                $scope.priceAdjust = new BigNumber(options.oldPrice || 0).mul(new BigNumber($scope.adjustValue || "0")).div(100).toString();
            }
        }
    };
    
    $scope.formatValue = function (number) {
        "use strict";
        return new BigNumber(number).toFormat();
    };
    
    $scope.switchAbsolute = function () {
        $scope.absoluteMode = !$scope.absoluteMode;
        $scope.adjustPrice();
    };
    
    $scope.init = function () {
        "use strict";
        $scope.options = options;
        BigNumber.config({
            FORMAT: {
                // the decimal separator
                decimalSeparator: '.',
                // the grouping separator of the integer part
                groupSeparator: ',',
                // the primary grouping size of the integer part
                groupSize: 3,
                // the secondary grouping size of the integer part
                secondaryGroupSize: 0,
                // the grouping separator of the fraction part
                fractionGroupSeparator: ' ',
                // the grouping size of the fraction part
                fractionGroupSize: 0
            }
        });
        $scope.absoluteMode = false;
        $scope.note = options.note || "";
        $scope.amount = options.amount || "";
        $scope.adjustValue = options.adjustValue;
        $scope.absoluteMode = options.absoluteMode;
        $scope.adjustPrice();
    };
}]);
