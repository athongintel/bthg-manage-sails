app.controller('AdminCustomerAddDialogController', ['$uibModalInstance', '$scope', '$http', function ($modalInstance, $scope, $http) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.checkCustomerAttribute = function (attr, value, oldValue) {
        "use strict";
        if (oldValue && oldValue === value) {
            return true;
        }
        else {
            return new Promise(function (resolve) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'check_attribute',
                    params: {
                        collection: 'Customer',
                        pairs: [{
                            attr: attr,
                            value: value
                        }]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorName]);
                    },
                    function (err) {
                        resolve(err)
                    }
                );
            });
        }
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
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                    console.log(response.data.error);
                }
            },
            function () {
                "use strict";
                $scope.processing = false;
                alert('Network error.');
            }
        );
    };
    
    $scope.init = function () {
        "use strict";
    };
    
}]);
