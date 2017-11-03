const BrandSelectorPartialController = function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
        ctrl.brandSelector = $('.partials_brand-selector_selector');
        let initSelector = function (data, value) {
            ctrl.brandSelector.select2({
                data: data,
                ajax: {
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
                }
            });
            ctrl.brandSelector.on('select2:select', function (e) {
                $scope.$apply(function () {
                    //-- keep a local change
                    ctrl.brand = e.params.data._id;
                    ctrl.onBrandChanged({selectedBrand: e.params.data._id});
                });
            });
            if (value){
                ctrl.brandSelector.val(value).trigger('change');
            }
        };
        
        if (ctrl.selectedBrand) {
            //-- ajax call to get branch data
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_product_brand',
                params: {_id: ctrl.selectedBrand}
            }).then(
                function (response) {
                    if (response.data.success) {
                        let brand = response.data.result;
                        initSelector([{id: brand._id, text: brand.name}], ctrl.selectedBrand);
                    }
                    else {
                        initSelector([]);
                    }
                },
                function () {
                    initSelector([]);
                }
            );
        }
        else {
            initSelector([]);
        }
        
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.brandSelector && objs['selectedBrand'] && (objs['selectedBrand'].currentValue !== ctrl.brand)) {
            ctrl.brandSelector.val(objs['selectedBrand'].currentValue).trigger('change');
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
