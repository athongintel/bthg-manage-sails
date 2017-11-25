app.controller('NavbarController', ['$scope', '$uibModal', function ($scope, $modal) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.login = function () {
        $modal.open({
            templateUrl: 'loginDialog',
            controller: 'LoginDialogController',
            backdrop: 'static',
            keyboard: false,
            scope: $scope,
        }).result.then(
            function (result) {
                //-- TODO show index based on roles...
                if (!$scope.global.user) $scope.global.user = result;
                if ($scope.global.user.userClass.indexOf(999) >= 0) {
                    document.location.href = '/#admin/index';
                }
            },
            function () {
            }
        );
    };
    
    ctrl.changeLanguage = function(lang){
        Cookies.set('lang', lang);
        //-- reload page
        document.location.reload();
    };
    
    ctrl.logout = function(){
        delete $scope.global.user;
        //-- redirect to main view
        document.location.href='/#';
    };
    
    ctrl.init = function(){
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries['action'] === 'login'){
            ctrl.login();
        }
        
        let btnNavbarToggle = $('#btnNavbarToggle');
        $('li.li-toggle').on('click', function(){
            if (btnNavbarToggle.is(":visible")) {
                btnNavbarToggle.click();
            }
        });
    };
    
}]);
