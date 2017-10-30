app.controller('AdminProductCategoryController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    ctrl.selectCategory = function(category){
        ctrl.selectedCategory = category;
    };
    
    ctrl.addCategory = function(){
        ctrl.newCategory = {
            _id: 0,
        }
    };
    
    ctrl.categories = [
        {_id: '1', name: 'cc03740q6-bc90q05c35fcwa5', size: '10'},
        {_id: '2', name: 'cc03740q6-bc90q05c35fcwa5', size: '10'},
        {_id: '3', name: 'cc03740q6-bc90q05c35fcwa5', size: '10'},
        {_id: '4', name: 'cc03740q6-bc90q05c35fcwa5', size: '10'},
    ];
    
}]);
