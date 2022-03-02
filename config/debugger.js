'use strict';

const { transports, createLogger, format } = require('winston');

require('winston-daily-rotate-file');

const debug = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
    // format.prettyPrint()
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: 'logs/payment-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '200m',
      maxFiles: '2d',
    }),
  ],
});

module.exports = debug;
