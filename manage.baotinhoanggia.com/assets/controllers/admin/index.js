app.controller('AdminIndexController', ['$scope', '$http', function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.saveCompanyInfo = function (data) {
        console.log(data);
        
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'set_system_variable',
            params: {
                name: 'COMPANY_INFO',
                value: JSON.stringify(data)
            }
        }).then(
            function (response) {
                if (response.data.success) {
                    alert($scope.global.utils.errors['SUCCESS']);
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    };
    
    ctrl.fixProductPrice = function () {
        ctrl.fixingPrice = true;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'fix_product_price',
            params: {}
        }).then(
            function (response) {
                ctrl.fixingPrice = false;
                if (response.data.success) {
                    alert($scope.global.utils.errors['SUCCESS']);
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                ctrl.fixingPrice = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        )
    };
    
    ctrl.init = function () {
        
        $http.post('/batch', {
            token: $scope.global.user.token,
            options: {},
            commands: [
                {
                    name: 'get_system_variable',
                    params: {
                        name: 'COMPANY_INFO'
                    }
                }
            ]
        }).then(
            function (response) {
                if (response.data.success) {
                    if (response.data.result[0].success) {
                        ctrl.companyInfo = JSON.parse(response.data.result[0].result.value);
                    }
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    }
    
}]);
