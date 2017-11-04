const BrandSelectorPartialController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    const brandSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_all_product_brands',
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
            data.forEach(function (brand) {
                brand.id = brand._id;
                brand.text = brand.name;
            });
            
            return {
                results: data
            };
        }
    };
    
    const initSelector = function (data, value) {
        ctrl.brandSelector.select2({
            data: data,
            ajax: brandSelectorAjax
        });
        ctrl.brandSelector.val(value).trigger('change');
    };
    
    const initSelectorWithData = function(selectedBrand){
        let data = [];
        let ids = [];
        if (selectedBrand && selectedBrand._id){
            data.push({id: selectedBrand._id, text: selectedBrand.name});
            ids.push(selectedBrand._id);
        }
        initSelector(data, ids);
    };
    
    ctrl.$onInit = function () {
        ctrl.brandSelector = $element.find('.partials_brand-selector_selector');
        ctrl.brandSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                ctrl.brand = e.params.data;
                ctrl.onBrandChanged({selectedBrand: e.params.data});
            });
        });
        initSelectorWithData(ctrl.selectedBrand);
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.brandSelector){
            //-- reflect change in UI level, not to trigger value change
            if(objs['selectedBrand'] && objs['selectedBrand'].currentValue !== ctrl.brand) {
                initSelectorWithData(objs['selectedBrand'].currentValue);
            }
        }
    };
};

app.component('brandSelector', {
    templateUrl: 'partials/brand-selector',
    controller: BrandSelectorPartialController,
    bindings: {
        global: '<',
        selectedBrand: '<',
        onBrandChanged: '&'
    }
});
