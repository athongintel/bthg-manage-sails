const OrderStatusSelectorController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.init = function(){
        console.log('init called');
    };
    
    ctrl.$onInit = function () {
        ctrl.options = [
            {value: '1', desc: 'ORDER_OPEN'},
            {value: '2', desc: ''},
            {value: '3', desc: ''},
            {value: '4', desc: ''},
            {value: '5', desc: ''},
        ]
    };
    
    ctrl.$onChanges = function (objs) {
    
    };
};

app.component('orderStatusSelector', {
    templateUrl: 'partials/order-status-selector',
    controller: OrderStatusSelectorController,
    bindings: {
        global: '<',
        preSelectStatus: '<',
        onStatusChanged: '&'
    }
});
