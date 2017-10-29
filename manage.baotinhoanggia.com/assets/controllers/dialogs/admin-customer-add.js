app.controller('AdminCustomerAddDialogController', ['$uibModalInstance', '$scope', '$http', function ($modalInstance, $scope, $http) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.addCustomer = function () {
        $scope.processing = true;
        $http.post('/rpc', {token: $scope.global.user.token, name: 'add_customer', params: {name: $scope.name, code: $scope.code, phoneNumber: $scope.phoneNumber, faxNumber: $scope.faxNumber, address: $scope.address}}).then(
            function(response){
                "use strict";
                $scope.processing = false;
                if (response.data.success){
                    $modalInstance.close(response.data.result);
                }
                else{
                    alert(response.data.error.errorMessage);
                }
            },
            function(err){
                "use strict";
                $scope.processing = false;
                console.log(err);
                alert('Network error.');
            }
        );
    }
}]);
