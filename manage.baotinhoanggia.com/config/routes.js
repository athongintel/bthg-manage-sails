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
    
    'GET /admin/product/list': {
        view: 'admin/product/list', locals: {layout: false}
    },
    
    'GET /admin/outorder/list': {
        view: 'admin/outorder/list', locals: {layout: false}
    },
    
    'GET /admin/outorder/new': {
        view: 'admin/outorder/new', locals: {layout: false}
    },
    
    'GET /partials/brand-selector': {
        view: 'partials/brand-selector', locals: {layout: false}
    },
    
    'GET /partials/type-selector': {
        view: 'partials/type-selector', locals: {layout: false}
    },
    
    'GET /partials/group-selector': {
        view: 'partials/group-selector', locals: {layout: false}
    },
    
    'GET /partials/supplier-selector': {
        view: 'partials/supplier-selector', locals: {layout: false}
    },
    
    'GET /partials/branch-selector': {
        view: 'partials/branch-selector', locals: {layout: false}
    },
    
    'GET /partials/multi-suppliers-selector': {
        view: 'partials/multi-suppliers-selector', locals: {layout: false}
    },
    
    'GET /partials/product-search': {
        view: 'partials/product-search', locals: {layout: false}
    },
    
    'GET /partials/product-details': {
        view: 'partials/product-details', locals: {layout: false}
    },
    
};
