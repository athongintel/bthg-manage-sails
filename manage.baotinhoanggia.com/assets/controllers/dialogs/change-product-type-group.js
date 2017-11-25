app.controller('ChangeProductTypeGroupDialogController', ['$scope', '$http', '$uibModalInstance', 'options', function($scope, $http, modalInstance, options){
    "use strict";
    
    $scope.close = function(){
        modalInstance.dismiss();
    };
    
    $scope.init = function (){
        $scope.selectedGroup = options.selectedGroup;
    };
    
    $scope.groupChanged = function(group) {
        $scope.newGroup = group;
    };
    
    $scope.changeGroup = function(){
        modalInstance.close({selectedGroup: $scope.newGroup});
    }
}]);
