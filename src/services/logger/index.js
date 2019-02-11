import winston from 'winston';
import DiscordLogger from 'winston-discord';

/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/

import CONFIG from '../../config';

const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(info => {
    const { timestamp, level, message, ...args } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);
const alignedWithTime = winston.format.combine(
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(info => {
    const { timestamp, level, message, ...args } = info;

    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);

const transports = [
  new winston.transports.Console({
    level: CONFIG.LOGGING_CONSOLE,
    format: alignedWithColorsAndTime,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    level: CONFIG.LOGGING_FILE,
    format: alignedWithTime,
  }),
];
if (CONFIG.LOGGING_DISCORD && CONFIG.LOGGING_DISCORD_WEBHOOK) {
  transports.push(
    new DiscordLogger({
      webhooks: CONFIG.LOGGING_DISCORD_WEBHOOK,
      level: CONFIG.LOGGING_DISCORD,
      inline: { server: 'Bundestag.io' },
    }),
  );
}
const myLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    graphql: 3,
    import: 4,
    verbose: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    graphql: 'magenta',
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
