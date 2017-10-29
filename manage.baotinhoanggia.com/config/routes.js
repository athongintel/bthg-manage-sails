module.exports.routes = {
  
  'GET /index': {
    view: 'app', locals: {layout: false}
  },
  
  'GET /rt-home': {
    view: 'admin/home', locals: {layout: false}
  },
  'GET /rt-contact': {
    view: 'admin/contact', locals: {layout: false}
  }
  
};
