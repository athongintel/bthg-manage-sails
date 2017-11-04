const SupplierSelectorPartialController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    const supplierSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_all_product_suppliers',
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
            data.forEach(function (supplier) {
                supplier.id = supplier._id;
                supplier.text = supplier.name;
            });
            
            return {
                results: data
            };
        }
    };
    
    const initSelector = function (data, value) {
        ctrl.supplierSelector.select2({
            data: data,
            ajax: supplierSelectorAjax
        });
        ctrl.supplierSelector.val(value).trigger('change');
    };
    
    const initSelectorWithData = function(selectedSupplier){
        let data = [];
        let ids = [];
        if (selectedSupplier && selectedSupplier._id){
            data.push({id: selectedSupplier._id, text: selectedSupplier.name});
            ids.push(selectedSupplier._id);
        }
        initSelector(data, ids);
    };
    
    ctrl.$onInit = function () {
        ctrl.supplierSelector = $element.find('.partials_supplier-selector_selector');
        ctrl.supplierSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                ctrl.supplier = e.params.data;
                ctrl.onSupplierChanged({selectedSupplier: e.params.data});
            });
        });
        initSelectorWithData(ctrl.selectedSupplier);
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.supplierSelector){
            //-- reflect change in UI level, not to trigger value change
            if(objs['selectedSupplier'] && objs['selectedSupplier'].currentValue !== ctrl.supplier) {
                initSelectorWithData(objs['selectedSupplier'].currentValue);
            }
        }
    };
};

app.component('supplierSelector', {
    templateUrl: 'partials/supplier-selector',
    controller: SupplierSelectorPartialController,
    bindings: {
        global: '<',
        selectedSupplier: '<',
        onSupplierChanged: '&'
    }
});
