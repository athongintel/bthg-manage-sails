const MultiBranchesSelectorPartialController = function ($scope, $element, $http, $timeout) {
    "use strict";
    
    const ctrl = this;
    
    ctrl.$onInit = function () {
        //-- load all branches
        $http.post('/rpc', {
            token: ctrl.global.user.token,
            name: 'get_all_branches',
            params: {}
        }).then(
            function (response) {
                if (response.data.success) {
                    ctrl.allBranches = response.data.result;
                    $timeout(function () {
                        ctrl.branchesSelector = $element.find('.selectpicker').selectpicker({
                            actionsBox: true
                        });
    
                        ctrl.branchesSelector.on('changed.bs.select', function () {
                            ctrl.branches = ctrl.branchesSelector.val();
                            $scope.$apply(function () {
                                ctrl.onBranchesChanged({selectedBranches: ctrl.branches});
                            });
                        });
    
                        ctrl.branchesSelector.on('data-change', function () {
                            ctrl.branchesSelector.selectpicker('refresh');
                            ctrl.branchesSelector.selectpicker('val', ctrl.branches);
                        });
                        
                        if (ctrl.branches){
                            ctrl.branchesSelector.trigger('data-change');
                        }
                    });
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorCode]);
                    console.log(response.data.error);
                }
            },
            function () {
                alert('Network error');
            }
        );
    };
    
    ctrl.$onChanges = function (objs) {
        // if (objs['allBranches'].currentValue) {
        //     $timeout(function () {
        //         if (ctrl.branchesSelector) ctrl.branchesSelector.trigger('data-change');
        //     });
        // }
        if (objs['preSelectedBranchIds'] && objs['preSelectedBranchIds'].currentValue) {
            ctrl.branches = objs['preSelectedBranchIds'].currentValue;
            if (ctrl.branchesSelector) {
                $timeout(function () {
                    ctrl.branchesSelector.trigger('data-change');
                });
            }
        }
    };
};

app.component('multiBranchesSelector', {
    templateUrl: 'partials/multi-branches-selector',
    controller: MultiBranchesSelectorPartialController,
    bindings: {
        global: '<',
        preSelectedBranchIds: '<',
        onBranchesChanged: '&',
    }
});
