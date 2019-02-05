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
  GRAPHIQL: process.env.GRAPHIQL === 'true' || false,
  GRAPHIQL_PATH: '/graphiql',
  GRAPHQL_PATH: '/',
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
