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
    OutStock: require('../api/models/outStock.model'),
    Branch: require('../api/models/branch.model'),
    Quotation: require('../api/models/quotation.model'),
    QuotationDetails: require('../api/models/quotationDetails.model'),
    OutStockOrder: require('../api/models/outStockOrder.model'),
    SystemVariable: require('../api/models/systemVariable.model'),
};

_app.errors = {
    SYSTEM_ERROR: {errorName: 'SYSTEM_ERROR'},
    INPUT_ERROR: {errorName: 'INPUT_ERROR'},
    MALFORMED_REQUEST_ERROR: {errorName: 'MALFORMED_REQUEST_ERROR'},
    NOT_FOUND_ERROR: {errorName: 'NOT_FOUND_ERROR'},
    TOKEN_GENERATING_ERROR: {errorName: 'TOKEN_GENERATING_ERROR'},
    WRONG_PASSWORD_ERROR: {errorName: 'WRONG_PASSWORD_ERROR'},
    NOT_SUPER_ADMIN_ERROR: {errorName: 'NOT_SUPER_ADMIN_ERROR'},
    NOT_AUTHENTICATED_ERROR: {errorName: 'NOT_AUTHENTICATED_ERROR'},
    DUPLICATED_ERROR: {errorName: 'DUPLICATED_ERROR'},
    RESOURCE_DIRTY_ERROR: {errorName: 'RESOURCE_DIRTY_ERROR'},
    TOKEN_INVALID_ERROR: {errorName: 'TOKEN_INVALID_ERROR'},
    NOT_AUTHORIZED_ERROR: {errorName: 'NOT_AUTHORIZED_ERROR'},
    BACKWARD_STATUS_ERROR: {errorName: 'BACKWARD_STATUS_ERROR'},
    ORDER_STATUS_NOT_ALLOWED: {errorName: 'ORDER_STATUS_NOT_ALLOWED'},
};
