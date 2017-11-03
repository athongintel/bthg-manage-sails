app.controller('ProductGroupSearchPartialController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.groupSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'get_all_product_categories',
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
            data.forEach(function (group) {
                group.id = group._id;
                group.text = group.name;
            });
        
            return {
                results: data
            };
        }
    };
    
    //-- @interface
    $scope.productGroupSelect = function (groupID) {
        ctrl.selectedProductGroup = groupID;
        $scope.$parent.productGroupSelect(groupID);
    };
    
    ctrl.init = function () {
        ctrl.groupSelector = $('#partials_product-group-search_select-product-group');
        ctrl.groupSelector.select2({
            ajax: ctrl.groupSelectorAjax
        });
    
        ctrl.groupSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                $scope.productGroupSelect(e.params.data._id);
            });
        });
        
        //-- watch for change in $scope.selectedProductGroup
        $scope.$watch('selectedProductGroup', function(newValue, oldValue){
            ctrl.groupSelector.val([newValue]).trigger('change');
        }, true);
        
        //-- watch for $scope.selectedProductType
        $scope.$watch('selectedProductType', function (newValue, oldValue) {
            //-- update corresponding selectedProductGroup, if newValue is null then do nothing
            if (newValue){
                //-- query to get this type
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'get_product_type',
                    params: {
                        _id: newValue
                    }
                }).then(
                    function (response) {
                        if (response.data.success) {
                            // console.log('response in product-group-search', response.data);
                            //-- check this type
                            let type = response.data.result;
                            if (String(type.groupID._id) !== ctrl.selectedProductGroup){
                                ctrl.groupSelector.empty();
                                ctrl.groupSelector.select2({data: [{id: type.groupID._id, text: type.groupID.name}], ajax: ctrl.groupSelectorAjax});
                                ctrl.groupSelector.val([type.groupID._id]).trigger('change');
                            }
                        }
                        else {
                        }
                    },
                    function (err) {
                    }
                );
            }
        }, true);
    }
    
}]);
