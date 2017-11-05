app.controller('AdminOutOrderListController', [function () {
    "use strict";
    
    const ctrl = this;
    
    ctrl.changeStatus = function (status) {
        console.log(status);
    };
    
    ctrl.changeCustomer = function (customer) {
        console.log(customer);
    };
    
    ctrl.changeType = function (type) {
        console.log(type);
    };
    
    ctrl.init = function () {
        
        $('#date-range-select').daterangepicker(
            {
                locale: {
                    format: 'YYYY-MM-DD'
                },
                startDate: '2013-01-01',
                endDate: '2013-12-31'
            },
            function (start, end, label) {
                alert("A new date range was chosen: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
            });
    };
    
}]);
