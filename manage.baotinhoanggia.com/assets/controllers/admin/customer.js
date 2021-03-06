app.controller('AdminCustomerController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    $scope.checkCustomerAttribute = function (attr, value, oldValue) {
        "use strict";
        if (oldValue && oldValue === value) {
            return true;
        }
        else {
            return new Promise(function (resolve) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'check_attribute',
                    params: {
                        collection: 'Customer',
                        pairs: [{
                            attr: attr,
                            value: value
                        }]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorName]);
                    },
                    function (err) {
                        resolve(err)
                    }
                );
            });
        }
    };
    
    ctrl.selectCustomer = function(customer){
        ctrl.showCustomerDetails = true;
        ctrl.loadingCustomerInfo = true;
        $http.post('/batch', {
            token: $scope.global.user.token,
            options: {},
            commands: [
                {
                    name: 'get_customer_info',
                    params: {_id: customer._id}
                },
                {
                    name: 'get_all_customer_contacts',
                    params: {customerID: customer._id}
                }
            ]
        }).then(
            function (response) {
                $timeout(function () {
                    ctrl.loadingCustomerInfo = false;
                    if (response.data.success) {
                        //-- load full customer info
                        ctrl.selectedCustomer = customer;
                        $scope.global.utils.mergeObject(ctrl.selectedCustomer, response.data.result[0].success ? response.data.result[0].result : null);
                        ctrl.selectedCustomerContacts = response.data.result[1].success ? response.data.result[1].result : null;
                    }
                    else {
                        ctrl.loadCustomerError = true;
                    }
                });
            
            },
            function (err) {
                $timeout(function () {
                    ctrl.loadingCustomerInfo = false;
                    ctrl.loadCustomerError = true;
                });
            }
        );
    };
    
    ctrl.addCustomer = function () {
        $modal.open({
            templateUrl: 'adminCustomerAddDialog',
            controller: 'AdminCustomerAddDialogController',
            scope: $scope,
            backdrop: 'static',
            keyboard: false
        }).result.then(
            function (result) {
                ctrl.allCustomers.push(result);
                ctrl.filterCustomer();
                ctrl.selectCustomer(result);
            },
            function () {
                //-- do nothing
            }
        );
    };
    
    ctrl.saveCustomer = function (data) {
        return new Promise(function (resolve) {
            ctrl.selectedCustomer.customerSaveProblem = false;
            data._id = ctrl.selectedCustomer._id;
            data.companyInfo = {
                name: data.companyInfo_name,
                taxNumber: data.companyInfo_taxNumber,
                address: data.companyInfo_address,
            };
            
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'update_customer_info',
                params: data
            }).then(
                function (response) {
                    if (!response.data.success) {
                        ctrl.selectedCustomer.customerSaveProblem = true;
                    }
                    resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorName]);
                },
                function () {
                    ctrl.selectedCustomer.customerSaveProblem = true;
                    resolve($scope.global.utils.errors['NETWORK_ERROR']);
                }
            );
        });
    };
    
    ctrl.addCustomerContact = function () {
        if (!ctrl.selectedCustomerContacts) ctrl.selectedCustomerContacts = [];
        //-- check if container empty row
        let emptyContact = ctrl.selectedCustomerContacts.find(function (contact) {
            return !contact._id;
        });
        if (!emptyContact) {
            ctrl.selectedCustomerContacts.push({_id: 0});
        }
    };
    
    ctrl.removeContact = function (id) {
        let removeIndex = ctrl.selectedCustomerContacts.findIndex(function (contact) {
            return contact._id === id;
        });
        if (removeIndex >= 0)
            ctrl.selectedCustomerContacts.splice(removeIndex, 1);
    };
    
    ctrl.updateContact = function (id, newContact) {
        let updateIndex = ctrl.selectedCustomerContacts.findIndex(function (contact) {
            return contact._id === id;
        });
        if (updateIndex >= 0)
            ctrl.selectedCustomerContacts[updateIndex] = newContact;
    };
    
    ctrl.updateCustomerContact = function (data, contact) {
        return new Promise(function (resolve) {
            let postData = {
                token: $scope.global.user.token,
                params: data
            };
            if (contact._id) {
                postData.name = 'update_customer_contact';
                postData.params._id = contact._id;
            }
            else {
                postData.name = 'add_customer_contact';
                postData.params.customerID = ctrl.selectedCustomer._id;
            }
            $http.post('/rpc', postData).then(
                function (response) {
                    if (response.data.success) {
                        ctrl.updateContact(contact._id, response.data.result);
                    }
                    resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorName]);
                },
                function () {
                    resolve($scope.global.utils.errors['NETWORK_ERROR']);
                }
            );
        });
    };
    
    ctrl.cancelEditCustomerContact = function (contact) {
        if (!contact._id)
            ctrl.removeContact(contact._id)
    };
    
    ctrl.removeCustomerContact = function (contact, i18n_confirm_remove_customer_contact) {
        if (!contact._id) {
            ctrl.removeContact(contact._id)
        }
        else {
            let ok = confirm(i18n_confirm_remove_customer_contact);
            if (ok) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'remove_customer_contact',
                    params: {_id: contact._id}
                }).then(
                    function (response) {
                        if (response.data.success) {
                            ctrl.removeContact(contact._id);
                        }
                        else {
                            alert($scope.global.utils.errors[respone.data.error.errorCode]);
                            console.log(respone.data.error)
                        }
                    },
                    function () {
                        alert($scope.global.utils.errors['NETWORK_ERROR']);
                    }
                );
            }
        }
    };
    
    ctrl.checkContactAttribute = function (attr, value, contact) {
        if (value === contact[attr]) {
            return true;
        }
        else {
            return new Promise(function (resolve) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'check_attribute',
                    params: {
                        collection: 'CustomerContact',
                        pairs: [{
                            attr: attr,
                            value: value
                        }]
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorName]);
                    },
                    function () {
                        resolve($scope.global.utils.errors['NETWORK_ERROR']);
                    }
                )
            });
        }
    };
    
    ctrl.filterCustomer = function(){
        let regex = new RegExp(`.*${ctrl.customerFilter? $scope.global.utils.regexEscape($scope.global.utils.removeAccent(ctrl.customerFilter)) : ""}.*`, 'i');
        ctrl.filteredCustomers = ctrl.allCustomers.filter(function(c){
            return !!regex.exec($scope.global.utils.removeAccent(c.name + JSON.stringify(c.companyInfo)));
        });
    };
    
    ctrl.init = function () {
        //-- get all customer
        ctrl.initializing = true;
        ctrl.initFailure = false;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'get_all_customers',
            params: {}
        }).then(
            function(response){
                ctrl.initializing = false;
                if (response.data.success){
                    ctrl.allCustomers = response.data.result;
                    // console.log(ctrl.allCustomers);
                    ctrl.filterCustomer();
                }
                else{
                    ctrl.initFailure = $scope.global.utils.errors[response.data.error.errorName];
                }
            },
            function(){
                ctrl.initializing = false;
                ctrl.initFailure = $scope.global.utils.errors['NETWORK_ERROR'];
            }
        );
        
        //-- check hash
        let queries = $scope.global.utils.breakQueries(document.location.hash);
        if (queries && queries.customerID) {
            //-- load product
            $scope.customerSelect(queries.customerID);
        }
    }
    
}]);
