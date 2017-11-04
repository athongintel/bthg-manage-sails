app.controller('AdminProductListController', ['$scope', '$http', '$timeout', '$uibModal', function ($scope, $http, $timeout, $modal) {
    "use strict";
    
    let ctrl = this;
    
    //-- shared variables
    ctrl.selectedProductId = null;
    
    ctrl.selectProduct = function(product){
        ctrl.selectedProductId = product? product._id : null;
    };
    
    // ctrl.viewPhoto = function (image) {
    //     $modal.open({
    //         templateUrl: 'viewPhotoDialog',
    //         controller: 'ViewPhotoDialogController',
    //         resolve: {
    //             options: function () {
    //                 return {photoUrl: image.url};
    //             }
    //         }
    //     }).result.then(function () {
    //     }, function () {
    //     });
    // };
    //
    
    ctrl.init = function () {
        
        //-- check hash
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries && queries.productID) {
            //-- load product
            ctrl.loadProduct(queries.productID);
        }
    };
    
}]);
//
// app.controller('AdminProductListDetailsController', ['$scope', '$http', '$timeout', '$uibModal', function ($scope, $http, $timeout, $modal) {
//     "use strict";
//
//     const ctrl = this;
//
//     //-- shared variables
//     ctrl.selectedBrand = null;
//
//     ctrl.changeSelectedBrand = function(brand){
//         ctrl.selectedBrand = brand;
//     };
//
//     ctrl.calculateAveragePrice = function (prices) {
//         let total = new BigNumber(0);
//         if (prices.length) {
//             prices.forEach(function (price) {
//                 if (price)
//                     total = total.add(new BigNumber(price.price));
//             });
//             total = total.dividedBy(prices.length);
//         }
//         return total.toString();
//     };
//
//     ctrl.addProductPhoto = function ($files) {
//         let currentCount = $scope.product.photos.length;
//         let left = 5 - currentCount;
//         let newPhotos = [];
//         for (let i = 0; i < Math.min($files.length, left); i++) {
//             newPhotos.push({
//                 localPhoto: true,
//                 file: $files[i]
//             });
//         }
//         $scope.product.photos = $scope.product.photos.concat(newPhotos);
//     };
//
//     ctrl.checkProductAttribute = function (attr, value, oldValue) {
//         if (oldValue && oldValue === value) {
//             return true;
//         }
//         else {
//             return new Promise(function (resolve) {
//                 $http.post('/rpc', {
//                     token: $scope.global.user.token,
//                     name: 'check_attribute',
//                     params: {
//                         collection: 'Product',
//                         pairs: [
//                             {
//                                 attr: 'typeID',
//                                 value: $scope.product.typeID._id
//                             },
//                             {
//                                 attr: 'brandID',
//                                 value: $scope.product.brandID._id
//                             },
//                             {
//                                 attr: 'model',
//                                 value: value
//                             }
//                         ]
//                     }
//                 }).then(
//                     function (response) {
//                         resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
//                     },
//                     function (err) {
//                         resolve('Network error');
//                     }
//                 )
//             });
//         }
//     };
//
//     ctrl.updateProduct = function (data) {
//         return new Promise(function (resolve) {
//             //-- temporary disable editting
//             $scope.product.isBeingEdited = false;
//
//             //-- calculate added photo counts;
//             let addedPhotos = [];
//             $scope.product.photos.forEach(function (p) {
//                 if (p.localPhoto) addedPhotos.push(p);
//             });
//             $http.post('/rpc', {
//                 token: $scope.global.user.token,
//                 name: 'update_product',
//                 params: {
//                     _id: $scope.product._id,
//                     model: data.model,
//                     description: data.description,
//                     brandID: ctrl.brandEditSelector.val(),
//                     supplierIDs: ctrl.suppliersEditSelector.val(),
//                     addedPhotos: addedPhotos.length,
//                 }
//             }).then(
//                 function (response) {
//                     //-- upload photos
//                     let updateSuccessHook = function () {
//                         $timeout(function () {
//                             //-- change the parent product, so we don't create any local product object
//                             $scope.$parent.product = response.data.result.product;
//                         }, 50);
//                         resolve(true);
//                     };
//                     //-- upload photos, match url and photos
//                     if (addedPhotos.length) {
//                         ctrl.uploadedCount = 0;
//                         ctrl.uploadingPhotos = true;
//                         for (let i = 0; i < addedPhotos.length; i++) {
//                             addedPhotos[i].isBeingUploaded = true;
//                             $http.put(response.data.result.uploadUrls[i], addedPhotos[i].file, {
//                                 headers: {
//                                     "Content-Type": 'image/*'
//                                 }
//                             }).then(
//                                 function () {
//                                     "use strict";
//                                     addedPhotos[i].isBeingUploaded = false;
//                                     addedPhotos[i].uploadSucceeded = true;
//                                     addedPhotos[i].uploadProceeded = true;
//                                     ctrl.uploadedCount++;
//                                     if (ctrl.uploadedCount === addedPhotos.length) {
//                                         ctrl.uploadingPhotos = false;
//                                         updateSuccessHook();
//                                     }
//                                 },
//                                 function () {
//                                     addedPhotos[i].isBeingUploaded = false;
//                                     addedPhotos[i].uploadSucceeded = false;
//                                     addedPhotos[i].uploadProceeded = true;
//                                     ctrl.uploadedCount++;
//                                     if (ctrl.uploadedCount === addedPhotos.length) {
//                                         ctrl.uploadingPhotos = false;
//                                         updateSuccessHook();
//                                     }
//                                 }
//                             );
//                         }
//                     }
//                     else {
//                         updateSuccessHook();
//                     }
//                 },
//                 function () {
//                     alert('Network error');
//                     resolve('Network error');
//                 }
//             );
//         });
//     };
//
//     ctrl.removeProductImage = function (image, i18n_remove_confirm) {
//         let index = $scope.product.photos.findIndex(function (p) {
//             return p === image;
//         });
//
//         if (image.localPhoto) {
//             if (index >= 0)
//                 $scope.product.photos.splice(index, 1);
//         }
//         else {
//             let okRemove = confirm(i18n_remove_confirm);
//             if (okRemove) {
//                 //-- post request to remove photos
//                 image.isBeingRemoved = true;
//                 $http.post('/rpc', {
//                     token: $scope.global.user.token,
//                     name: 'remove_product_photo',
//                     params: {
//                         _id: $scope.product._id,
//                         fileName: image.fileName
//                     }
//                 }).then(
//                     function (response) {
//                         image.isBeingRemoved = false;
//                         if (response.data.success) {
//                             //-- update local model
//                             $scope.product.photos.splice(index, 1);
//                         }
//                         else {
//                             alert($scope.global.utils.errors[response.data.error.errorCode]);
//                         }
//                     },
//                     function () {
//                         image.isBeingRemoved = false;
//                         alert('Network error');
//                     }
//                 );
//             }
//         }
//     };
//

//
// }]);
