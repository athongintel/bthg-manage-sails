app.controller('LoginDialogController', ['$uibModalInstance', '$scope', '$http', function ($modalInstance, $scope, $http) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };
    
    $scope.login = function () {
        $scope.processing = true;
        $http.post('/rpc', {name: 'login', params: {authMethod: 0, username: $scope.username, authData: {password: $scope.password}}}).then(
            function(response){
                "use strict";
                $scope.processing = false;
                if (response.data.success){
                    $modalInstance.close(response.data.result);
                }
                else{
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function(){
                "use strict";
                $scope.processing = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            }
        );
    }
}]);
