let app = document.app;

app.controller('NavbarController', ['$scope', '$uibModal', function ($scope, $modal) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.login = function () {
        $modal.open({
           templateUrl: 'loginDialog',
           controller: 'LoginDialogController'
        }).result.then(
            function(response){
            
            },
            function(err){
            
            }
        );
    };
    
}]);
