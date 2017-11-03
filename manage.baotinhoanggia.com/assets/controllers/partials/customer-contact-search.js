app.controller('CustomerContactSearchPartialController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
    "use strict";
    
    //-- @interface
    $scope.customerContactSelect = function(customerContactID){
        $scope.$parent.customerContactSelect(customerContactID);
    };
    
    $scope.init = function(){
        let customerContactSelector = $('#partials_customer-contact-search_select-contact');
        customerContactSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_all_customer_contacts',
                        params: {
                            customerID: $scope.selectedCustomerID,
                            query: params.data.term
                        }
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
                    data.forEach(function (contact) {
                        contact.id = contact._id;
                        contact.text = contact.name + (contact.lastName? ' ' + contact.lastName : '');
                    });
                
                    return {
                        results: data
                    };
                }
            }
        });
        customerContactSelector.on('select2:select', function (e) {
            $timeout(function(){
                $scope.customerContactSelect(e.params.data._id);
            });
            
        });
        $scope.$watch('selectedCustomerID', function(){
            customerContactSelector.val('').trigger('change');
        }, true);
    }
}]);
