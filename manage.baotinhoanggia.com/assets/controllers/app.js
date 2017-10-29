document.app = angular.module('app', ['ngRoute']);

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

navigation.controller('homeCtrl', function ($scope, $http) {

});

navigation.controller('contactCtrl', function ($scope, $http) {

});

