const TypeSelectorPartialController = function ($scope, $http) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
        ctrl.typeSelector = $('.partials_type-selector_selector');
        
        let initSelector = function (data, value) {
            ctrl.typeSelector.select2({
                data: data,
                ajax: {
                    transport: function (params, success, failure) {
                        $http.post('/rpc', {
                            token: ctrl.global.user.token,
                            name: 'get_all_product_types',
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
                        data.forEach(function (type) {
                            type.id = type._id;
                            type.text = type.name;
                        });
                        
                        return {
                            results: data
                        };
                    }
                }
            });
            ctrl.typeSelector.on('select2:select', function (e) {
                $scope.$apply(function () {
                    //-- keep a local change
                    ctrl.type = e.params.data._id;
                    ctrl.onTypeChanged({selectedType: e.params.data._id});
                });
            });
            if (value){
                ctrl.typeSelector.val(value).trigger('change');
            }
        };
        
        if (ctrl.selectedType) {
            //-- ajax call to get type data
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_product_type',
                params: {_id: ctrl.selectedType}
            }).then(
                function (response) {
                    if (response.data.success) {
                        let type = response.data.result;
                        initSelector([{id: type._id, text: type.name}], ctrl.selectedType);
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
        if (ctrl.typeSelector && objs['selectedType'] && (objs['selectedType'].currentValue !== ctrl.type)) {
            ctrl.typeSelector.val(objs['selectedType'].currentValue).trigger('change');
        }
    };
};

app.component('typeSelector', {
    templateUrl: 'partials/type-selector',
    controller: TypeSelectorPartialController,
    bindings: {
        global: '<',
        selectedType: '<',
        onTypeChanged: '&'
    }
});
