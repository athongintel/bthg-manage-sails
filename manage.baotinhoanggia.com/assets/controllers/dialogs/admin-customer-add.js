app.controller('AdminCustomerAddDialogController', ['$uibModalInstance', '$scope', '$http', function ($modalInstance, $scope, $http) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.addCustomer = function () {
        $scope.processing = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'add_customer',
            params: {
                name: $scope.name,
                code: $scope.code,
                phoneNumber: $scope.phoneNumber,
                faxNumber: $scope.faxNumber,
                address: $scope.address,
                companyInfo: $scope.companyInfo
            }
        }).then(
            function (response) {
                "use strict";
                $scope.processing = false;
                if (response.data.success) {
                    $modalInstance.close(response.data.result);
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                }
            },
            function (err) {
                "use strict";
                $scope.processing = false;
                alert('Network error.');
            }
        );
    };
    
    $scope.init = function(){};
    
}]);
