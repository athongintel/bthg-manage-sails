app.controller('AdminSettingsController', ['$scope', '$http', function($scope, $http){
    "use strict";
    
    const ctrl = this;
    
    ctrl.changePassword = function(){
        $scope.processing = true;
    
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'change_password',
            params: {
                oldPassword: ctrl.models.currentPassword,
                newPassword: ctrl.models.newPassword
            }
        }).then(
            function (response) {
                $scope.processing = false;
                if (response.data.success) {
                    ctrl.models = {};
                    alert($scope.global.utils.errors['SUCCESS']);
                }
                else {
                    alert($scope.global.utils.errors[response.data.error.errorName]);
                }
            },
            function () {
                $scope.processing = false;
                alert($scope.global.utils.errors['NETWORK_ERROR']);
            });
        
    }
    
}]);
