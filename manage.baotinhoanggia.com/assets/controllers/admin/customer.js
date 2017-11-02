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
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
                    },
                    function (err) {
                        resolve(err)
                    }
                );
            });
        }
    };
    
    ctrl.selectedCustomer = null;
    
    ctrl.addCustomer = function () {
        $modal.open({
            templateUrl: 'adminCustomerAddDialog',
            controller: 'AdminCustomerAddDialogController',
            scope: $scope,
            backdrop: 'static',
            keyboard: false
        }).result.then(
            function (result) {
                if (!$scope.global.data.customers) $scope.global.data.customers = [];
                $scope.global.data.customers.push(result);
                ctrl.selectedCustomer = result;
                ctrl.selectedCustomerContacts = [];
            },
            function () {
                //-- do nothing
            }
        );
    };
    
    ctrl.saveCustomer = function (data) {
        console.log(data);
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
                    resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
                },
                function () {
                    ctrl.selectedCustomer.customerSaveProblem = true;
                    resolve('Network error');
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
                    resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
                },
                function (err) {
                    resolve('Network error.');
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
                            alert(respone.data.error.errorMessage);
                        }
                    },
                    function (err) {
                        //-- TODO: remove failed
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
                        resolve(response.data.success || $scope.global.utils.errors[response.data.error.errorCode]);
                    },
                    function (err) {
                        resolve('Network error');
                    }
                )
            });
        }
    };
    
    ctrl.init = function () {
        
        let customerSelector = $('#select_customer');
        customerSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_customer_meta_info',
                        params: {query: params.data.term}
                    }).then(
                        function (response) {
                            if (response.data.success) {
                                success(response.data.result);
                            }
                            else {
                                failure();
                            }
                        },
                        function (err) {
                            failure();
                        }
                    );
                },
                processResults: function (data) {
                    data.forEach(function (customer) {
                        customer.id = customer._id;
                        customer.text = customer.name;
                    });
                    
                    return {
                        results: data
                    };
                }
            }
        });
        customerSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.loadingCustomerInfo = true;
            });
            $http.post('/batch', {
                token: $scope.global.user.token,
                options: {},
                commands: [
                    {
                        name: 'get_customer_info',
                        params: {_id: e.params.data._id}
                    },
                    {
                        name: 'get_all_customer_contacts',
                        params: {customerID: e.params.data._id}
                    }
                ]
            }).then(
                function (response) {
                    $timeout(function () {
                        ctrl.loadingCustomerInfo = false;
                        if (response.data.success) {
                            //-- load full customer info
                            ctrl.selectedCustomer = response.data.result[0].success ? response.data.result[0].result : null;
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
        });
    }
    
}]);
