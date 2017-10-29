module.exports.bootstrap = function (cb) {
  
  //-- connect to db
  console.log('Connecting to database...');
  const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;
  mongoose.connect(`mongodb://${sails.config.MONGO_USERNAME && sails.config.MONGO_USERPASSWORD? sails.config.MONGO_USERNAME + ':' + sails.config.MONGO_USERPASSWORD + '@' : ''}${sails.config.MONGO_SERVER}:${sails.config.MONGO_PORT}/${sails.config.MONGO_DBNAME}`, {useMongoClient: true});
  mongoose.connection.on('error', err => {
    "use strict";
    cb(err);
  });
  
  mongoose.connection.once('open', async () => {
    "use strict";
    //-- db connect success, init other things
    console.log('- ok');
    try {
      
      let initResult;
      let services = ['UserService'];
      for (let i = 0; i < services.length; i++) {
        console.log(`Init ${services[i]}...`);
        initResult = await require(`../api/services/${services[i]}`).init();
        if (!initResult.success) {
          console.log('Error: ', initResult);
          return cb(initResult);
        }
        console.log('- ok');
      }
      
      console.log('All services had been successfully initialized. API is running at port ' + sails.config.port);
      cb();
    }
    catch (err) {
      cb(err);
    }
  });
  
};
