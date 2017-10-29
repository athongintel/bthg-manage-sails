global._app = {};

_app.model = {
    User: require('../api/models/user.model'),
    Auth: require('../api/models/auth.model'),
    Customer: require('../api/models/customer.model'),
};

_app.errors = {
    SYSTEM_ERROR: {errorCode: 1, errorMessage: 'System error'},
    INPUT_ERROR: {errorCode: 2, errorMessage: 'Invalid input'},
    MALFORMED_REQUEST_ERROR: {errorCode: 3, errorMessage: 'The request is malformed'},
    NOT_FOUND_ERROR: {errorCode: 4, errorMessage: 'Not found'},
    TOKEN_GENERATING_ERROR: {errorCode: 5, errorMessage: 'Cannot generate user token'},
    WRONG_PASSWORD_ERROR: {errorCode: 6, errorMessage: 'The provided password is not correct'},
    NOT_SUPER_ADMIN_ERROR: {errorCode: 7, errorMessage: 'Require super admin role'},
    NOT_AUTHENTICATED_ERROR: {errorCode: 7, errorMessage: 'Require authentication'},
};
