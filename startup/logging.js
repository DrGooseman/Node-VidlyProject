require('express-async-errors');
const winston = require('winston');
//require('winston-mongodb');

module.exports = function() {
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: "uncaughtExceptions.log" })
      );
      
      
      process.on("unhandledRejection", (ex) => {
        throw ex;
      });
      
      
     // winston.configure({transports: [new winston.transports.File({ filename: 'logfile.log' }) ]});
      
      //THIS GIVE AN ERROR NOW!
      winston.add(winston.transports.File, { filename: "logfile.log" });
      
      //winston.add(winston.transports.MongoDB, { db: "mongodb://localhost/vidly", level: "info" });
};