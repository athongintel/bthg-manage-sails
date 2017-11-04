const CustomerSelectorPartialController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    const customerSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_all_customers',
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
    };
    
    const initSelector = function (data, value) {
        ctrl.customerSelector.select2({
            data: data,
            ajax: customerSelectorAjax
        });
        ctrl.customerSelector.val(value).trigger('change');
    };
    
    const initSelectorWithData = function(selectedCustomer){
        let data = [];
        let ids = [];
        if (selectedCustomer && selectedCustomer._id){
            data.push({id: selectedCustomer._id, text: selectedCustomer.name});
            ids.push(selectedCustomer._id);
        }
        initSelector(data, ids);
    };
    
    ctrl.$onInit = function () {
        ctrl.customerSelector = $element.find('.partials_customer-selector_selector');
        ctrl.customerSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                ctrl.customer = e.params.data;
                ctrl.onCustomerChanged({selectedCustomer: e.params.data});
            });
        });
        initSelectorWithData(ctrl.selectedCustomer);
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.customerSelector){
            //-- reflect change in UI level, not to trigger value change
                if(objs['selectDisabled']){
                    ctrl.customerSelector.select2().enable(objs['selectDisabled'].currentValue === null || objs['selectDisabled'].currentValue);
                }
            if(objs['selectedCustomer'] && objs['selectedCustomer'].currentValue !== ctrl.customer) {
                initSelectorWithData(objs['selectedCustomer'].currentValue);
            }
        }
    };
};

app.component('customerSelector', {
    templateUrl: 'partials/customer-selector',
    controller: CustomerSelectorPartialController,
    bindings: {
        global: '<',
        selectDisabled: '<',
        selectedCustomer: '<',
        onCustomerChanged: '&'
    }
});
