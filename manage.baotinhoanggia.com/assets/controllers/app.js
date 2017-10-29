let app = document.app = angular.module('app', ['ngRoute', 'ngStorage', 'ui.bootstrap', 'ngSanitize', 'xeditable']);

app.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

app.config(function ($routeProvider) {
    
    $routeProvider
        .when('/admin/index', {
            templateUrl: '/admin/index',
            controller: 'AdminController'
        })
        .when('/admin/customer', {
            templateUrl: '/admin/customer',
            controller: 'AdminCustomerController'
        })
});

app.controller('GlobalController', ['$scope', '$sessionStorage', function ($scope, $sessionStorage) {
    "use strict";
    
    if (!$sessionStorage.global) {
        $sessionStorage.global = {};
    }
    $scope.global = $sessionStorage.global;
    
    $scope.isPath = function(path){
        let subPath = document.location.pathname + document.location.search + document.location.hash;
        return subPath.indexOf(path) === 3;
    };
    
    $scope.global.locale = (Cookies.get('lang') || window.navigator.language || 'en');
    $scope.global.data = {};
    
    moment.locale($scope.global.locale);
}]);
