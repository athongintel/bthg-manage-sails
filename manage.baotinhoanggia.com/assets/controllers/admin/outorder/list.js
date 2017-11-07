app.controller('AdminOutOrderListController', ['$scope', '$http', function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.changeStatus = function (status) {
        ctrl.selectedStatus = status;
    };
    
    ctrl.changeCustomer = function (customer) {
        ctrl.selectedCustomer = customer;
    };
    
    ctrl.changeType = function (type) {
        ctrl.selectedType = type;
    };
    
    ctrl.changeDateRange = function(dateRange){
        console.log('change dateRange to: ', dateRange);
        ctrl.selectedDateRange = dateRange;
    };
    
    ctrl.filterOrder = function(){
        //-- check for params
        let postData = {
            token: $scope.global.user.token,
            name: 'get_all_out_orders',
            params: {
                status: ctrl.selectedStatus,
                customerID: ctrl.selectedCustomer._id,
                productTypeID: ctrl.selectedType._id,
                dateRange: ctrl.selectedDateRange.start && ctrl.selectedDateRange.end ? ctrl.selectedDateRange : null
            }
        };
        
        $http.post('/rpc', postData).then(
            function(response){
                if (response.data.success){
                
                }
                else{
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                }
            },
            function(){
                alert('Network error');
            }
        );
    };
    
    ctrl.init = function () {
        ctrl.selectedStatus = null;
        ctrl.selectedCustomer = null;
        ctrl.selectedType = null;
        ctrl.selectedDateRange = null;
    };
    
}]);
