app.controller('AdminCustomerController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
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
            function (err) {
                //-- do nothing
            }
        );
    };
    
    ctrl.saveCustomer = function () {
        ctrl.selectedCustomer.customerSaveProblem = false;
        $http.post('/rpc', {
            token: $scope.global.user.token,
            name: 'update_customer_info',
            params: ctrl.selectedCustomer
        }).then(
            function (response) {
                if (!response.data.success) {
                    ctrl.selectedCustomer.customerSaveProblem = true;
                }
            },
            function (err) {
                ctrl.selectedCustomer.customerSaveProblem = true;
            }
        );
    };
    
    ctrl.addCustomerContact = function(){
        if (!ctrl.selectedCustomerContacts) ctrl.selectedCustomerContacts = [];
        //-- check if container empty row
        let emptyContact = ctrl.selectedCustomerContacts.find(function(contact){
           return !contact._id;
        });
        if (!emptyContact) {
            ctrl.selectedCustomerContacts.push({_id: 0});
        }
    };
    
    ctrl.checkContact = function(data){
        console.log(data);
    };
    
    ctrl.removeContact = function(id){
        let removeIndex = ctrl.selectedCustomerContacts.findIndex(function(contact){
            return contact._id === id;
        });
        if (removeIndex >= 0)
            ctrl.selectedCustomerContacts.splice(removeIndex, 1);
    };
    
    ctrl.updateContact = function(id, newContact){
        let updateIndex = ctrl.selectedCustomerContacts.findIndex(function(contact){
            return contact._id === id;
        });
        if (updateIndex >= 0)
            ctrl.selectedCustomerContacts[updateIndex] = newContact;
    };
    
    ctrl.updateCustomerContact = function(contact){
        let data = {
            token: $scope.global.user.token,
            params: contact
        };
        data.name = contact._id? 'update_customer_contact' : 'add_customer_contact';
        data.params.customerID = data.customerID || ctrl.selectedCustomer._id;
        
        $http.post('/rpc', data).then(
            function(response){
                if (response.data.success){
                    ctrl.updateContact(contact._id, response.data.result);
                }
                else{
                    contact.updateError = true;
                }
            },
            function(err){
                contact.updateError = true;
            }
        );
    };
    
    ctrl.cancelEditCustomerContact = function(contact){
        if (!contact._id)
            ctrl.removeContact(contact._id)
    };
    
    
    
    ctrl.removeCustomerContact = function(contact, i18n_confirm_remove_customer_contact){
        if (!contact._id) {
            ctrl.removeContact(contact._id)
        }
        else{
            let ok = confirm(i18n_confirm_remove_customer_contact);
            if (ok){
                $http.post('/rpc', {token: $scope.global.user.token, name: 'remove_customer_contact', params: {_id: contact._id}}).then(
                    function(response){
                        if (response.data.success){
                            ctrl.removeContact(contact._id);
                        }
                        else{
                            //-- TODO: remove failed
                        }
                    },
                    function(err){
                        //-- TODO: remove failed
                    }
                );
            }
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
                            // console.log('response in transport: ', response);
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
                            ctrl.selectedCustomer = response.data.results[0].success? response.data.results[0].result : null;
                            ctrl.selectedCustomerContacts = response.data.results[1].success? response.data.results[1].result : null;
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
