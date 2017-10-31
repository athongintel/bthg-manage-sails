app.controller('AdminSupplierController', ['$scope', '$http', '$uibModal', '$timeout', function ($scope, $http, $modal, $timeout) {
    "use strict";
    
    let ctrl = this;
    
    $scope.checkSupplierAttribute = function (attr, value, oldValue) {
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
                        collection: 'Supplier',
                        attr: attr,
                        value: value
                    }
                }).then(
                    function (response) {
                        resolve(response.data.success || response.data.error.errorMessage);
                    },
                    function (err) {
                        resolve(err)
                    }
                );
            });
        }
    };
    
    ctrl.selectedSupplier = null;
    
    ctrl.addSupplier = function () {
        $modal.open({
            templateUrl: 'adminSupplierAddDialog',
            controller: 'AdminSupplierAddDialogController',
            scope: $scope,
            backdrop: 'static',
            keyboard: false
        }).result.then(
            function (result) {
                if (!$scope.global.data.suppliers) $scope.global.data.suppliers = [];
                $scope.global.data.suppliers.push(result);
                ctrl.selectedSupplier = result;
                ctrl.selectedSupplierContacts = [];
            },
            function () {
                //-- do nothing
            }
        );
    };
    
    ctrl.saveSupplier = function (data) {
        return new Promise(function (resolve) {
            ctrl.selectedSupplier.supplierSaveProblem = false;
            data._id = ctrl.selectedSupplier._id;
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'update_supplier_info',
                params: data
            }).then(
                function (response) {
                    if (!response.data.success) {
                        ctrl.selectedSupplier.supplierSaveProblem = true;
                    }
                    resolve(response.data.success || response.data.error.errorMessage);
                },
                function () {
                    ctrl.selectedSupplier.supplierSaveProblem = true;
                    resolve('Network error');
                }
            );
        });
    };
    
    ctrl.addSupplierContact = function () {
        if (!ctrl.selectedSupplierContacts) ctrl.selectedSupplierContacts = [];
        //-- check if container empty row
        let emptyContact = ctrl.selectedSupplierContacts.find(function (contact) {
            return !contact._id;
        });
        if (!emptyContact) {
            ctrl.selectedSupplierContacts.push({_id: 0});
        }
    };
    
    ctrl.removeContact = function (id) {
        let removeIndex = ctrl.selectedSupplierContacts.findIndex(function (contact) {
            return contact._id === id;
        });
        if (removeIndex >= 0)
            ctrl.selectedSupplierContacts.splice(removeIndex, 1);
    };
    
    ctrl.updateContact = function (id, newContact) {
        let updateIndex = ctrl.selectedSupplierContacts.findIndex(function (contact) {
            return contact._id === id;
        });
        if (updateIndex >= 0)
            ctrl.selectedSupplierContacts[updateIndex] = newContact;
    };
    
    ctrl.updateSupplierContact = function (data, contact) {
        return new Promise(function (resolve) {
            console.log(data, contact);
            let postData = {
                token: $scope.global.user.token,
                params: data
            };
            if (contact._id) {
                postData.name = 'update_supplier_contact';
                postData.params._id = contact._id;
            }
            else {
                postData.name = 'add_supplier_contact';
                postData.params.supplierID = ctrl.selectedSupplier._id;
            }
            $http.post('/rpc', postData).then(
                function (response) {
                    if (response.data.success) {
                        ctrl.updateContact(contact._id, response.data.result);
                    }
                    resolve(response.data.success || response.data.error.errorMessage);
                },
                function (err) {
                    console.log(err);
                    resolve('Network error.');
                }
            );
        });
    };
    
    ctrl.cancelEditSupplierContact = function (contact) {
        if (!contact._id)
            ctrl.removeContact(contact._id)
    };
    
    ctrl.removeSupplierContact = function (contact, i18n_confirm_remove_supplier_contact) {
        if (!contact._id) {
            ctrl.removeContact(contact._id)
        }
        else {
            let ok = confirm(i18n_confirm_remove_supplier_contact);
            if (ok) {
                $http.post('/rpc', {
                    token: $scope.global.user.token,
                    name: 'remove_supplier_contact',
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
        // if (value === contact[attr]) {
        //     return true;
        // }
        // else {
        return new Promise(function (resolve) {
            $http.post('/rpc', {
                token: $scope.global.user.token,
                name: 'check_attribute',
                params: {
                    collection: 'SupplierContact',
                    attr: attr,
                    value: value
                }
            }).then(
                function (response) {
                    resolve(response.data.success || response.data.error.errorMessage);
                },
                function (err) {
                    resolve('Network error');
                }
            )
        });
        // }
    };
    
    ctrl.init = function () {
        
        let supplierSelector = $('#select_supplier');
        supplierSelector.select2({
            ajax: {
                transport: function (params, success, failure) {
                    $http.post('/rpc', {
                        token: $scope.global.user.token,
                        name: 'get_supplier_meta_info',
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
                    data.forEach(function (supplier) {
                        supplier.id = supplier._id;
                        supplier.text = supplier.name;
                    });
                    
                    return {
                        results: data
                    };
                }
            }
        });
        supplierSelector.on('select2:select', function (e) {
            $timeout(function () {
                ctrl.loadingSupplierInfo = true;
            });
            $http.post('/batch', {
                token: $scope.global.user.token,
                options: {},
                commands: [
                    {
                        name: 'get_supplier_info',
                        params: {_id: e.params.data._id}
                    },
                    {
                        name: 'get_all_supplier_contacts',
                        params: {supplierID: e.params.data._id}
                    }
                ]
            }).then(
                function (response) {
                    $timeout(function () {
                        ctrl.loadingSupplierInfo = false;
                        if (response.data.success) {
                            //-- load full supplier info
                            ctrl.selectedSupplier = response.data.results[0].success ? response.data.results[0].result : null;
                            ctrl.selectedSupplierContacts = response.data.results[1].success ? response.data.results[1].result : null;
                        }
                        else {
                            ctrl.loadSupplierError = true;
                        }
                    });
                    
                },
                function (err) {
                    $timeout(function () {
                        ctrl.loadingSupplierInfo = false;
                        ctrl.loadSupplierError = true;
                    });
                }
            );
        });
    }
    
}]);
