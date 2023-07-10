import winston from 'winston';
import config from '../config';

const { combine, printf, colorize, timestamp, errors } = winston.format;
const { Console } = winston.transports;
const { logLevel } = config.logger;

const format = combine(
  colorize({ all: true }),
  timestamp({ format: 'YY-MM-DD HH:MM:SS' }),
  printf((info) => {
    const {
      level, message, timestamp: ts, service, stack, method, path,
    } = info;
    const requestInfo = (method) ? `(${method} ${path})` : '';
    const stacked = (stack) ? `\n${stack}` : '';
    return ` [${ts}][${service}][${level}]${requestInfo}: ${message} ${stacked}`;
  }),
);

const logger = winston.createLogger({
  defaultMeta: { service: 'API' },
  format: errors({ stack: true }),
  level: logLevel,
  transports: [new Console({ format })],
});

export default logger;
