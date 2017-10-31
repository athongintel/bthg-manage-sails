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
    
    'GET /admin/supplier': {
        view: 'admin/supplier', locals: {layout: false}
    },
    
    'GET /admin/product/new': {
        view: 'admin/product/new', locals: {layout: false}
    },
    
    'GET /admin/product/category': {
        view: 'admin/product/category', locals: {layout: false}
    },
    
    'GET /admin/product/brand': {
        view: 'admin/product/brand', locals: {layout: false}
    },
    
};
