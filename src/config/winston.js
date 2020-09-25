'use strict';

const winston = require('winston');
const {combine, simple, colorize} = winston.format;
// const errorStackFormat = format(info => {
//     if (info instanceof Error) {
//         return Object.assign({}, info, {
//             stack: info.stack,
//             message: info.message
//         })
//     }
//     return info;
// })
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.Console(),
        // new winston.transports.File({filename: 'logs/winston-error.log', level: 'error'}),
        // new winston.transports.File({filename: 'logs/winston-activity.log', level:'info'})
    ]
});
// logger.stream = 
//     write: function(message, encoding){
        
//         logger.info(message);
//     }
// };

//logger.info('it works!!');

module.exports = logger;

