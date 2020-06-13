
var appRoot = require('app-root-path');



const { createLogger, format, transports, config } = require('winston');

require('winston-syslog').Syslog;


const logger = createLogger({
  levels: config.syslog.levels,
  defaultMeta: { component: 'user-service' },
  /*
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    json()

  ),*/
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log'})
  ],
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })

  ]
});
module.exports = logger;
