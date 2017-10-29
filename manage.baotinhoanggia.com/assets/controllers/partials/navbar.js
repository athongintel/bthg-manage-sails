app.controller('NavbarController', ['$scope', '$uibModal', function ($scope, $modal) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.login = function () {
        $modal.open({
            templateUrl: 'loginDialog',
            controller: 'LoginDialogController',
            backdrop: 'static',
            keyboard: false
        }).result.then(
            function (result) {
                //-- show index based on roles...
                if (!$scope.global.user) $scope.global.user = result;
                if ($scope.global.user.userClass.indexOf(999) >= 0) {
                    $scope.global.navigation[0] = "admin";
                    $scope.global.navigation[1] = "home";
                    document.location.href = '/#admin';
                }
            },
            function (err) {
                //-- do nothing
            }
        );
    };
    
    ctrl.logout = function(){
        delete $scope.global.user;
        //-- redirect to main view
        $scope.global.navigation[0] = null;
        document.location.href='/#';
    }
    
}]);
