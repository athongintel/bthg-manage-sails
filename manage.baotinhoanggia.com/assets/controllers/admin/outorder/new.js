app.controller('AdminOutOrderNewController', ['$scope', function($scope){
    "use strict";
    
    const ctrl = this;
    
    ctrl.selectCustomer = function(customer){
        ctrl.selectedCustomer = customer;
        ctrl.customerContactDisabled = false;
    };
    
    ctrl.init = function(){
        ctrl.selectedBranch = $scope.global.user.branchID;
        ctrl.disableBranch = true;
        ctrl.customerContactDisabled = true;
    }
    
}]);
