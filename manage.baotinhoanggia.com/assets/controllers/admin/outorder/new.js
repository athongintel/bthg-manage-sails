app.controller('AdminOutOrderNewController', ['$scope', function($scope){
    "use strict";
    
    //-- @implement partials_product-search
    $scope.selectProduct = function(product){
    
    };
    
    //-- @implement partials_customer-search
    $scope.customerSelect = function(customerID){
        $scope.selectedCustomerID = customerID;
    };
    
    //-- @implement partials_customer-contact-search
    $scope.customerContactSelect = function(customerContactID){
        $scope.selectedCustomerContactID = customerContactID;
    }
    
}]);
