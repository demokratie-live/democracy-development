import jwt from './jwt';
import smsverification from './smsverification';
// import humanconnection from './humanconnection';
import cronjobConfig from './cronjobConfig';

const requiredConfigs = {
  // No default Values
  ...smsverification,
  ...jwt,
};

const recommendedConfigs = {
  // No correct default Values
  PORT: process.env.PORT || 3000,
  MIN_PERIOD: parseInt(process.env.MIN_PERIOD || '19', 10),
  GRAPHQL_PATH: process.env.GRAPHQL_PATH || '/',
  GRAPHIQL: process.env.GRAPHIQL === 'true',
  DB_URL: process.env.DB_URL || 'mongodb://localhost/democracy',
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'elasticsearch',
  BUNDESTAGIO_SERVER_URL: process.env.BUNDESTAGIO_SERVER_URL || 'http://localhost:4000/',
  APN_TOPIC: ((): string => {
    switch (process.env.STAGE) {
      case 'dev':
        return 'de.democracy-deutschland.clientapp.new';
      case 'internal':
        return 'de.democracy-deutschland.clientapp.internal';
      case 'alpha':
        return 'de.democracy-deutschland.clientapp.alpha';
      case 'beta':
        return 'de.democracy-deutschland.clientapp.beta';
      case 'production':
        return 'de.democracy-deutschland.clientapp';
      default:
        console.error('ERROR: no STAGE defined!'); // eslint-disable-line no-console
        return 'de.democracy-deutschland.clientapp';
    }
  })(),
  NOTIFICATION_ANDROID_SERVER_KEY: process.env.NOTIFICATION_ANDROID_SERVER_KEY || null,
  APPLE_APN_KEY: process.env.APPLE_APN_KEY || null,
  APPLE_APN_KEY_ID: process.env.APPLE_APN_KEY_ID || null,
  APPLE_TEAMID: process.env.APPLE_TEAMID || null,
  // ...humanconnection,
  ...cronjobConfig,
};

const optionalConfigs = {
  // Default Values given
  DEBUG: process.env.DEBUG === 'true',
  ENGINE_API_KEY: process.env.ENGINE_API_KEY || null,
  ENGINE_DEBUG_MODE: process.env.ENGINE_DEBUG_MODE === 'true',
  VOYAGER: process.env.VOYAGER || false,
  // Logging
  LOGGING_CONSOLE: process.env.LOGGING_CONSOLE,
  LOGGING_FILE: process.env.LOGGING_FILE,
  LOGGING_DISCORD: process.env.LOGGING_DISCORD,
  LOGGING_DISCORD_TOKEN: process.env.LOGGING_DISCORD_TOKEN,
  LOGGING_DISCORD_WEBHOOK: process.env.LOGGING_DISCORD_WEBHOOK,
  LOGGING_MONGO: process.env.LOGGING_MONGO !== 'false' || false,
};

export default {
  ...requiredConfigs,
  ...recommendedConfigs,
  ...optionalConfigs,
};
