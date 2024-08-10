import pino from 'pino';

const log = pino({
  level: process.env.PINO_LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export { log };
