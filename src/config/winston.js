'use strict';

const {transports, createLogger, format} = require('winston');

    const logger = createLogger({
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console(),
            new transports.File({filename: 'logs/winston-error.log', level: 'error'}),
            new transports.File({filename: 'logs/winston-activity.log', level:'info'})
        ]
    });
    
    logger.stream = {
        write: function(message, encoding){
            
            logger.info(message);
        }
    };
  
  //logger.info('it works!!');

module.exports = logger;

