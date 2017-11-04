const CustomerContactSelectorPartialController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    const customerContactSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_all_customer_contacts',
                params: {
                    customerID: ctrl.selectedCustomer._id,
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
            data.forEach(function (customerContact) {
                customerContact.id = customerContact._id;
                customerContact.text = customerContact.name + (customerContact.lastName? ' ' +customerContact.lastName : '');
            });
            
            return {
                results: data
            };
        }
    };
    
    const disableSelection = function(disabled){
        ctrl.customerContactSelector.prop('disabled', disabled);
    };
    
    const initSelector = function (data, value) {
        ctrl.customerContactSelector.select2({
            data: data,
            ajax: customerContactSelectorAjax
        });
        ctrl.customerContactSelector.val(value).trigger('change');
        disableSelection(ctrl.selectDisabled);
    };
    
    const initSelectorWithData = function(selectedCustomerContact){
        let data = [];
        let ids = [];
        if (selectedCustomerContact && selectedCustomerContact._id){
            data.push({id: selectedCustomerContact._id, text: selectedCustomerContact.name});
            ids.push(selectedCustomerContact._id);
        }
        initSelector(data, ids);
    };
    
    ctrl.$onInit = function () {
        ctrl.customerContactSelector = $element.find('.partials_customer-contact-selector_selector');
        ctrl.customerContactSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                ctrl.customerContact = e.params.data;
                ctrl.onCustomerContactChanged({selectedCustomerContact: e.params.data});
            });
        });
        initSelectorWithData(ctrl.selectedCustomerContact);
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.customerContactSelector){
            //-- reflect change in UI level, not to trigger value change
            if(objs['selectDisabled']){
                disableSelection(objs['selectDisabled'].currentValue);
            }
            if(objs['selectedCustomer']) {
                initSelector([], []);
            }
            if(objs['selectedCustomerContact'] && objs['selectedCustomerContact'].currentValue !== ctrl.customerContact) {
                initSelectorWithData(objs['selectedCustomerContact'].currentValue);
            }
        }
    };
};

app.component('customerContactSelector', {
    templateUrl: 'partials/customer-contact-selector',
    controller: CustomerContactSelectorPartialController,
    bindings: {
        global: '<',
        selectDisabled: '<',
        selectedCustomer: '<',
        selectedCustomerContact: '<',
        onCustomerContactChanged: '&'
    }
});
