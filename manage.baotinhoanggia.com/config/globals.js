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
    SYSTEM_ERROR: {errorCode: 1},
    INPUT_ERROR: {errorCode: 2},
    MALFORMED_REQUEST_ERROR: {errorCode: 3},
    NOT_FOUND_ERROR: {errorCode: 4},
    TOKEN_GENERATING_ERROR: {errorCode: 5},
    WRONG_PASSWORD_ERROR: {errorCode: 6},
    NOT_SUPER_ADMIN_ERROR: {errorCode: 7},
    NOT_AUTHENTICATED_ERROR: {errorCode: 8},
    DUPLICATED_ERROR: {errorCode: 9},
    RESOURCE_DIRTY_ERROR: {errorCode: 10},
    TOKEN_INVALID_ERROR: {errorCode: 11},
    NOT_AUTHORIZED_ERROR: {errorCode: 12},
};
