app.controller('CustomerSearchPartialController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
    "use strict";
    
    //-- @interface
    $scope.customerSelect = function(customerID){
        $scope.$parent.customerSelect(customerID);
    };
    
    $scope.init = function(){
        let customerSelector = $('#partials_customer-search_select-customer');
        customerSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_customer_meta_info',
                        params: {query: params.data.term}
                    }).then(
                        function (response) {
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
                    data.forEach(function (customer) {
                        customer.id = customer._id;
                        customer.text = customer.name;
                    });
                
                    return {
                        results: data
                    };
                }
            }
        });
        
        customerSelector.on('select2:select', function (e) {
            $timeout(function(){
                $scope.customerSelect(e.params.data._id);
            });
            
        });
    }
    
}]);
