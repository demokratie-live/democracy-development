/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/
export default {
  PORT: process.env.PORT || 3100,
  DB_URL: process.env.DB_URL || 'mongodb://localhost:27020/bundestagio',
  DEMOCRACY_SERVER_WEBHOOK_URL:
    process.env.DEMOCRACY_SERVER_WEBHOOK_URL || 'http://localhost:3000/webhooks/bundestagio/update',
  DEMOCRACY: {
    WEBHOOKS: {
      UPDATE_PROCEDURES:
        process.env.DEMOCRACY_WEBHOOKS_UPDATE_PROCEDURES ||
        'http://democracy/webhooks/bundestagio/updateProcedures',
    },
  },
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'elasticsearch',
  ENGINE_API_KEY: process.env.ENGINE_API_KEY || null,
  PLAYGROUND_PATH: process.env.PLAYGROUND_PATH || false,
  GRAPHQL_PATH: process.env.GRAPHQL_PATH || '/',
  WHITELIST_DATA_SOURCES: process.env.WHITELIST_DATA_SOURCES
    ? process.env.WHITELIST_DATA_SOURCES.split(',')
    : ['::ffff:127.0.0.1', '::1'],
  LOGGING: {
    CONSOLE: process.env.LOGGING_CONSOLE || false,
    FILE: process.env.LOGGING_FILE || false,
    DISCORD: process.env.LOGGING_DISCORD || false,
    DISCORD_WEBHOOK: process.env.LOGGING_DISCORD_WEBHOOK || false,
    MONGO: process.env.LOGGING_MONGO || false,
  },
};
