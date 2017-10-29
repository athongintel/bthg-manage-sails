app.controller('AdminCustomerController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.selectedCustomer = null;
    
    ctrl.addCustomer = function () {
        $modal.open({
            templateUrl: 'adminCustomerAddDialog',
            controller: 'AdminCustomerAddDialogController',
            scope: $scope,
            backdrop: 'static',
            keyboard: false
        }).result.then(
            function (result) {
                if (!$scope.global.data.customers) $scope.global.data.customers = [];
                $scope.global.data.customers.push(result);
                ctrl.selectedCustomer = result;
            },
            function (err) {
                //-- do nothing
            }
        );
    };
    
    ctrl.init = function () {
        
        let customerSelector = $('#select_customer');
        customerSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_customer_meta_info',
                        params: {query: params.data.term}
                    }).then(
                        function (response) {
                            // console.log('response in transport: ', response);
                            if (response.data.success) {
                                success(response.data.result);
                            }
                            else {
                                failure();
                            }
                        },
                        function (err) {
                            failure();
                        }
                    );
                },
                processResults: function (data) {
                    // console.log('result:', data);
                    let formattedData = data.map(function (customer) {
                        customer.id = customer._id;
                        customer.text = customer.name;
                        return customer;
                    });
                    
                    return {
                        results: formattedData
                    };
                }
            }
        });
        customerSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.loadingCustomerInfo = true;
            });
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'get_customer_info',
                params: {_id: e.params.data._id}
            }).then(
                function (response) {
                    $timeout(function () {
                        ctrl.loadingCustomerInfo = false;
                        if (response.data.success) {
                            //-- load full customer info
                            ctrl.selectedCustomer = response.data.result;
                        }
                        else {
                            ctrl.loadCustomerError = true;
                        }
                    });
                    
                },
                function (err) {
                    $timeout(function () {
                        ctrl.loadingCustomerInfo = false;
                        ctrl.loadCustomerError = true;
                    });
                }
            );
        });
    }
    
}]);
