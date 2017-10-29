module.exports.routes = {
    
    //-- core routes
    'POST /rpc': {controller: 'BatchController', action: 'rpc'},
    'POST /batch': {controller: 'BatchController', action: 'batch'},
    
    //-- view GET routes
    'GET /': {
        view: 'app', locals: {layout: false}
    },
    
    'GET /admin/index': {
        view: 'admin/index', locals: {layout: false}
    },
    
    'GET /admin/customer': {
        view: 'admin/customer', locals: {layout: false}
    },
    
};
