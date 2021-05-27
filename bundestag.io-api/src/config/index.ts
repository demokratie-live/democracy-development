/*
  THIS FILE AND ALL IMPORTS ARE NOT ALLOWED TO INCLUDE ANY MONGOOSE MODELS
  See index.js for more info
*/

const requiredConfigs = {
  // No default Values
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
};

const recommendedConfigs = {
  // No correct default Values
  PORT: process.env.PORT || 3100,
  DB_URL: process.env.DB_URL || 'mongodb://localhost:27017/bundestagio',
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'elasticsearch',
  PERIODS: process.env.PERIODS ? process.env.PERIODS.split(',') : ['Alle'],
};

const optionalConfigs = {
  // Default Values given
  GRAPHQL_PATH: process.env.GRAPHQL_PATH || '/',
  GRAPHIQL: process.env.GRAPHIQL || false,
  ENGINE_API_KEY: process.env.ENGINE_API_KEY || null,
  ENGINE_DEBUG_MODE: process.env.ENGINE_DEBUG_MODE === 'true',
  VOYAGER: process.env.VOYAGER || false,
  // Logging
  LOGGING_CONSOLE: process.env.LOGGING_CONSOLE || false,
  LOGGING_FILE: process.env.LOGGING_FILE || false,
  LOGGING_DISCORD: process.env.LOGGING_DISCORD || false,
  LOGGING_DISCORD_WEBHOOK: process.env.LOGGING_DISCORD_WEBHOOK || false,
  LOGGING_MONGO: process.env.LOGGING_MONGO === 'true' || false,
};

// Merge and export Configs
export default {
  ...requiredConfigs,
  ...recommendedConfigs,
  ...optionalConfigs,
};
