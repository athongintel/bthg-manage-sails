const GroupSelectorPartialController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    const groupSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: ctrl.global.user.token,
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
    
    const initSelector = function (data, value) {
        ctrl.groupSelector.select2({
            data: data,
            ajax: groupSelectorAjax
        });
        ctrl.groupSelector.val(value).trigger('change');
    };
    
    const initSelectorWithData = function(selectedGroup){
        let data = [];
        let ids = [];
        if (selectedGroup && selectedGroup._id){
            data.push({id: selectedGroup._id, text: selectedGroup.name});
            ids.push(selectedGroup._id);
        }
        initSelector(data, ids);
    };
    
    ctrl.$onInit = function () {
        ctrl.groupSelector = $element.find('.partials_group-selector_selector');
        ctrl.groupSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                ctrl.group = e.params.data;
                ctrl.onGroupChanged({selectedGroup: e.params.data});
            });
        });
        initSelectorWithData(ctrl.selectedGroup);
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.groupSelector){
            //-- reflect change in UI level, not to trigger value change
            if(objs['selectedGroup'] && objs['selectedGroup'].currentValue !== ctrl.group) {
                initSelectorWithData(objs['selectedGroup'].currentValue);
            }
        }
    };
};

app.component('groupSelector', {
    templateUrl: 'partials/group-selector',
    controller: GroupSelectorPartialController,
    bindings: {
        global: '<',
        selectedGroup: '<',
        onGroupChanged: '&'
    }
});
