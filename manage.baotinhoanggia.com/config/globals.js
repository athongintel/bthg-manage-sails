global._app = {};

_app.model = {
    User: require('../api/models/user.model'),
    Auth: require('../api/models/auth.model'),
    Customer: require('../api/models/customer.model'),
    CustomerContact: require('../api/models/customerContact.model'),
    Supplier: require('../api/models/supplier.model'),
    SupplierContact: require('../api/models/supplierContact.model'),
    ProductGroup: require('../api/models/productGroup.model'),
    ProductType: require('../api/models/productType.model'),
    ProductBrand: require('../api/models/productBrand.model'),
    Product: require('../api/models/product.model'),
    InStock: require('../api/models/inStock.model'),
    Branch: require('../api/models/branch.model'),
};

_app.errors = {
    SYSTEM_ERROR: {errorCode: 1, errorMessage: 'System error'},
    INPUT_ERROR: {errorCode: 2, errorMessage: 'Invalid input'},
    MALFORMED_REQUEST_ERROR: {errorCode: 3, errorMessage: 'The request is malformed'},
    NOT_FOUND_ERROR: {errorCode: 4, errorMessage: 'Not found'},
    TOKEN_GENERATING_ERROR: {errorCode: 5, errorMessage: 'Cannot generate user token'},
    WRONG_PASSWORD_ERROR: {errorCode: 6, errorMessage: 'The provided password is not correct'},
    NOT_SUPER_ADMIN_ERROR: {errorCode: 7, errorMessage: 'Require super admin role'},
    NOT_AUTHENTICATED_ERROR: {errorCode: 8, errorMessage: 'Require authentication'},
    DUPLICATED_ERROR: {errorCode: 9, errorMessage: 'Duplicated'},
    RESOURCE_DIRTY_ERROR: {errorCode: 10, errorMessage: 'The resource is dirty'},
    TOKEN_INVALID_ERROR: {errorCode: 11, errorMessage: 'The session is expired'},
};
