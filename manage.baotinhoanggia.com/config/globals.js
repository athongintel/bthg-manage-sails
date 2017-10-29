global._app = {};

_app.model = {
    User: require('../api/models/user.model'),
    Auth: require('../api/models/auth.model'),
};

_app.errors = {
    SYSTEM_ERROR: {errorCode: 1, errorMessage: 'System error'},
    INPUT_ERROR: {errorCode: 2, errorMessage: 'Invalid input'},
    MALFORMED_REQUEST_ERROR: {errorCode: 3, errorMessage: 'The request is malformed'},
};
