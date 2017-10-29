document.app = angular.module('app', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'xeditable']);

let navigation = document.app;

navigation.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

navigation.config(function ($routeProvider) {
  
  $routeProvider
    .when('/admin/home', {
      templateUrl: '/admin/home',
      controller: 'homeCtrl'
    })
    .when('/admin/contact', {
      templateUrl: '/admin/contact',
      controller: 'contactCtrl'
    });
});

document.app.controller('GlobalController', ['$scope', function($scope){
    "use strict";
    
    $scope.global = {};
}]);
