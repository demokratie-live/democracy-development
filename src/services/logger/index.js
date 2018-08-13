import winston from 'winston';
import DiscordLogger from 'winston-discord';

import constants from '../../config/constants';

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);
const alignedWithTime = winston.format.combine(
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const {
      timestamp, level, message, ...args
    } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);

const transports = [
  new winston.transports.Console({
    level: constants.LOGGING.CONSOLE,
    format: alignedWithColorsAndTime,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    level: constants.LOGGING.FILE,
    format: alignedWithTime,
  }),
];
if (constants.LOGGING.DISCORD && constants.LOGGING.DISCORD_WEBHOOK) {
  transports.push(new DiscordLogger({
    webhooks: constants.LOGGING.DISCORD_WEBHOOK,
    level: constants.LOGGING.DISCORD,
  }));
}
const myLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    notification: 3,
    import: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    notification: 'magenta',
    import: 'magenta',
    verbose: 'blue',
    debug: 'blue',
    silly: 'gray',
  },
};

const logger = winston.createLogger({
  levels: myLevels.levels,
  transports,
});
winston.addColors(myLevels.colors);

global.Log = logger;
