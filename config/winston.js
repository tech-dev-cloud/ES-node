'use strict';

const { createLogger, transports, format } = require('winston');
const { combine, simple, colorize } = format;
module.exports = class Logger {
  static _conosleLogger = this.consoleLogger();
  static winstonLogger = this.createLoggerInstance();
  static consoleLogger() {
    return createLogger({
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.simple()
          ),
          debugStdout: true,
        }),
      ],
    });
  }

  static createLoggerInstance() {
    return createLogger({
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.simple()
          ),
          debugStdout: true,
        }),
        new transports.File({
          filename: 'logs/winston-error.log',
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
          filename: 'logs/winston-activity.log',
          level: 'info',
          format: format.combine(format.timestamp(), format.json()),
        }),
      ],
    });
  }

  static info(message) {
    this.winstonLogger.info(message);
  }

  static warn(message) {
    this.winstonLogger.warn(message);
  }

  static error(message) {
    this.winstonLogger.error(message);
  }

  static logMessage(message) {
    if (config.debugLogging) {
      this._conosleLogger.info(message);
    }
  }
};

// const logger = winston.createLogger({
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json(),
//     winston.format.prettyPrint()
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({
//       filename: 'logs/winston-error.log',
//       level: 'error',
//     }),
//     new winston.transports.File({
//       filename: 'logs/winston-activity.log',
//       level: 'info',
//     }),
//   ],
// });

// module.exports = logger;
