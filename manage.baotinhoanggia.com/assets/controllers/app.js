document.app = angular.module('app', ['ngRoute']);

let navigation = document.app;

navigation.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

navigation.config(function ($routeProvider) {
  
  console.log('reached navigation');
  
  $routeProvider
    
    .when('/admin/rt-home', {
      templateUrl: '/rt-home',
      controller: 'homeCtrl'
    })
    .when('/admin/rt-contact', {
      templateUrl: '/rt-contact',
      controller: 'contactCtrl'
    });
});

navigation.controller('homeCtrl', function ($scope, $http) {

});

navigation.controller('contactCtrl', function ($scope, $http) {

});

