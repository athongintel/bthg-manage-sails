const OrderStatusSelectorController = function ($scope, $element, $timeout) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.changeStatus = function () {
        ctrl.onStatusChanged({selectedStatus: ctrl.selectedStatus.value});
    };
    
    ctrl.$onInit = function () {
        ctrl.options = [
            {value: '1', desc: 'ORDER_OPEN'},
            {value: '2', desc: 'ORDER_CONFIRMED'},
            {value: '3', desc: 'ORDER_PAYMENT_RECEIVED'},
            {value: '4', desc: 'ORDER_FINISHED'},
            {value: '5', desc: 'ORDER_CANCELED'},
        ];
        $timeout(function () {
            ctrl.selectedStatus = ctrl.options.find(function (opt) {
                return String(opt.value) === String(ctrl.preSelectedStatus);
            });
        });
    };
    
    ctrl.$onChanges = function (objs) {
    
    };
};

app.component('orderStatusSelector', {
    templateUrl: 'partials/order-status-selector',
    controller: OrderStatusSelectorController,
    bindings: {
        global: '<',
        preSelectedStatus: '<',
        onStatusChanged: '&'
    }
});
