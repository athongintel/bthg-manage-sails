app.controller('AdminOutOrderListController', ['$scope', '$http', '$uibModal', function ($scope, $http, $modal) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.DATETIME_FORMAT = 'DD-MM-YYYY ~ HH:mm';
    ctrl.status = ['', 'ORDER_OPEN', 'ORDER_CONFIRMED', 'ORDER_PAYMENT_RECEIVED', 'ORDER_FINISHED', 'ORDER_CANCELED'];
    
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
        ctrl.selectedDateRange = dateRange;
    };
    
    ctrl.showQuotationDetails = function(quotation){
        $modal.open({
            templateUrl: 'quotationDetailsDialog',
            controller: 'QuotationDetailsDialogController',
            // size: 'lg',
            backdrop: 'static',
            resolve: {
                options: function(){
                    return {quotationId: quotation._id};
                }
            },
            scope: $scope,
        }).result.then(
            function(){}, function(){}
        );
    };
    
    ctrl.orderStatusChanged = function(status){
        console.log('status changed', status);
        ctrl.orderDetails.statusTimestamp.push(status);
    };
    
    ctrl.showOrderDetails = function(orderID){
        ctrl.selectedOrder = orderID;
        ctrl.loadingOrderDetails = true;
    
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_out_order_details',
            params:{
                _id: orderID
            }
        }).then(
            function(response){
                ctrl.filtering = false;
                if (response.data.success){
                    ctrl.loadingOrderDetails = false;
                    if (response.data.result.quots)
                        response.data.result.quots.sort(function(a, b){
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        });
                    ctrl.orderDetails = response.data.result;
                    // console.log(ctrl.orderDetails);
                }
                else{
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function(){
                ctrl.loadingOrderDetails = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
        
    };
    
    ctrl.filterOrder = function(){
        //-- check for params
        
        ctrl.filtering = true;
        let postData = {
            token: $scope.global.user.token,
            name: 'get_all_out_orders',
            params: {
                status: ctrl.selectedStatus,
                customerID: ctrl.selectedCustomer? ctrl.selectedCustomer._id : null,
                productTypeID: ctrl.selectedType? ctrl.selectedType._id : null,
                dateRange: ctrl.selectedDateRange && ctrl.selectedDateRange.date1 && ctrl.selectedDateRange.date2 ? ctrl.selectedDateRange : null
            }
        };
        
        $http.post('/rpc', postData).then(
            function(response){
                ctrl.filtering = false;
                if (response.data.success){
                    ctrl.filteredResults = response.data.result.sort(function(a, b){
                        // console.log(a.statusTimestamp, b.statusTimestamp);
                        return !!b.statusTimestamp? !!a.statusTimestamp? moment(b.statusTimestamp[0].at).unix() - moment(a.statusTimestamp[0].at).unix() : 1 : -1;
                    });
                }
                else{
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function(){
                ctrl.filtering = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    };
    
    ctrl.init = function () {
        ctrl.selectedOrder = null;
        ctrl.selectedStatus = null;
        ctrl.selectedCustomer = null;
        ctrl.selectedType = null;
        ctrl.selectedDateRange = null;
        
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries['outOrderID']){
            ctrl.showOrderDetails(queries['outOrderID']);
        }
    };
    
}]);
