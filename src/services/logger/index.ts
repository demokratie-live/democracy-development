import winston from 'winston';
import { MongoDB } from 'winston-mongodb';

import CONFIG from '../../config';

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);
// const alignedWithTime = winston.format.combine(
//   winston.format.timestamp(),
//   winston.format.align(),
//   winston.format.printf(info => {
//     const { timestamp, level, message, ...args } = info;

//     const ts = timestamp.slice(0, 19).replace('T', ' ');
//     return `${ts} [${level}]: ${message} ${
//       Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
//     }`;
//   }),
// );

const transports = [
  new winston.transports.Console({
    level: CONFIG.LOGGING_CONSOLE,
    format: alignedWithColorsAndTime,
  }),
  // new winston.transports.File({
  //   filename: 'logs/combined.log',
  //   level: CONFIG.LOGGING_FILE,
  //   format: alignedWithTime,
  // }),
];

const myLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    import: 4,
    jwt: 5,
    graphql: 6,
    verbose: 7,
    debug: 8,
    silly: 9,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    notification: 'magenta',
    import: 'magenta',
    jwt: 'magenta',
    graphql: 'magenta',
    verbose: 'blue',
    debug: 'blue',
    silly: 'gray',
  },
};

const logger = winston.createLogger({
  levels: myLevels.levels,
  transports,
}) as winston.Logger & { jwt: any; graphql: any };
winston.addColors(myLevels.colors);

if (process.env.NODE_ENV !== 'test') {
  logger.add(
    new MongoDB({
      db: CONFIG.DB_URL,
      level: 'warn',
    }),
  );
}

export { logger };
