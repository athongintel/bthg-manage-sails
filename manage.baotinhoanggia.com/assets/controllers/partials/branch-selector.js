const BranchSelectorPartialController = function ($scope, $element, $http) {
    "use strict";
    
    const ctrl = this;
    
    const branchSelectorAjax = {
        transport: function (params, success, failure) {
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_all_branches',
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
            data.forEach(function (branch) {
                branch.id = branch._id;
                branch.text = branch.name;
            });
            
            return {
                results: data
            };
        }
    };
    
    const disableSelection = function(disabled){
        ctrl.branchSelector.prop("disabled", disabled);
    };
    
    const initSelector = function (data, value) {
        ctrl.branchSelector.select2({
            data: data,
            ajax: branchSelectorAjax
        });
        ctrl.branchSelector.val(value).trigger('change');
        disableSelection(ctrl.selectDisabled) ;
    };
    
    const initSelectorWithData = function(selectedBranch){
        let data = [];
        let ids = [];
        if (selectedBranch){
            $http.post('/rpc', {
                token: ctrl.global.user.token,
                name: 'get_branch',
                params: {_id: selectedBranch}
            }).then(
                function (response) {
                    if (response.data.success) {
                        data.push({id: response.data.result._id, text: response.data.result.name});
                        ids.push(response.data.result._id);
                    }
                    initSelector(data, ids);
                },
                function () {
                    initSelector(data, ids);
                }
            );
        }
        else {
            initSelector(data, ids);
        }
    };
    
    ctrl.$onInit = function () {
        ctrl.branchSelector = $element.find('.partials_branch-selector_selector');
        ctrl.branchSelector.on('select2:select', function (e) {
            $scope.$apply(function () {
                ctrl.branch = e.params.data;
                ctrl.onBranchChanged({selectedBranch: e.params.data});
            });
        });
        initSelectorWithData(ctrl.selectedBranch);
    };
    
    ctrl.$onChanges = function (objs) {
        if (ctrl.branchSelector){
            //-- reflect change in UI level, not to trigger value change
            if(objs['selectDisabled']){
                disableSelection(objs['selectDisabled'].currentValue);
            }
            if(objs['selectedBranch'] && objs['selectedBranch'].currentValue !== ctrl.branch) {
                initSelectorWithData(objs['selectedBranch'].currentValue);
            }
        }
    };
};

app.component('branchSelector', {
    templateUrl: 'partials/branch-selector',
    controller: BranchSelectorPartialController,
    bindings: {
        global: '<',
        selectDisabled: '<',
        selectedBranch: '<',
        onBranchChanged: '&'
    }
});
