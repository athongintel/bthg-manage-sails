module.exports.routes = {
    
    //-- core routes
    'POST /rpc': {controller: 'BatchController', action: 'rpc'},
    'POST /batch': {controller: 'BatchController', action: 'batch'},
    
    //-- view GET routes
    'GET /': {
        view: 'app', locals: {layout: false}
    },
    'GET /admin/home': {
        view: 'admin/home', locals: {layout: false}
    },
    'GET /admin/contact': {
        view: 'admin/contact', locals: {layout: false}
    }
    
};
