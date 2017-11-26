const OrderStatusSelectorController = function ($scope, $element, $timeout) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.changeStatus = function () {
        ctrl.onStatusChanged({selectedStatus: ctrl.selectedStatus.value});
    };
    
    ctrl.$onInit = function () {
        ctrl.options = ctrl.global.utils.ORDER_STATUS;
    };
    
    ctrl.$onChanges = function (objs) {
        if (objs['preSelectedStatus']){
            $timeout(function () {
                ctrl.selectedStatus = ctrl.options.find(function (opt) {
                    return String(opt.value) === String(objs['preSelectedStatus'].currentValue);
                });
            });
        }
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
