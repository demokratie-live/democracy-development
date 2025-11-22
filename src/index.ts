/* eslint-disable no-console */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './express/auth';

// *****************************************************************
// IMPORTANT - you cannot include any models before migrating the DB
// *****************************************************************

import CONFIG from './config';

import { logger } from './services/logger';

import { connectDB } from './services/mongoose';
import { appVersion } from './express/appVersion';
import { applicationId } from './express/applicationId';

const main = async () => {
  // Connect to DB - this keeps the process running
  // IMPORTANT - This is done before any Model is registered
  await connectDB();

  // Express Server
  const server = express();

  if (process.env.EXPRESS_STATUS === 'true') {
    const expressStatusMonitor = await import('express-status-monitor');
    server.use(expressStatusMonitor.default());
  }

  // Cors
  server.use(cors(/* corsOptions */));
  /*
  const corsOptions = {
    origin: '*',
    // credentials: true, // <-- REQUIRED backend setting
  };
  */

  // Cookie parser to debug JWT easily
  if (CONFIG.DEBUG) {
    server.use(cookieParser());
  }

  // Authentification
  // Here several Models are included

  server.use(authMiddleware);

  // add version to graphql context
  server.use(appVersion);

  // add application id to graphql context
  server.use(applicationId);

  // Human Connection webhook
  // const smHumanConnection = require('./express/webhooks/socialmedia/humanconnection'); // eslint-disable-line global-require
  // server.get('/webhooks/human-connection/contribute', smHumanConnection);

  // Graphql
  // Here several Models are included for graphql
  const graphql = await import('./services/graphql');
  graphql.default.applyMiddleware({ app: server, path: CONFIG.GRAPHQL_PATH });

  // Start Server
  server.listen({ port: CONFIG.PORT }, () => {
    logger.info(`🚀 Server ready at http://localhost:${CONFIG.PORT}${CONFIG.GRAPHQL_PATH}`, {
      metaKey: 'metaValue',
    });
  });

  // Start CronJobs (Bundestag Importer)
  // Serveral Models are included
  const { default: cronJobs } = await import('./services/cronJobs');
  cronJobs();
};

// Async Wrapping Function
// Catches all errors
(async () => {
  await main();
})().catch((error) => {
  // Log error with full details including stack trace
  logger.error('Error in main async function', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(error.cause && { cause: error.cause }),
  });
  // Also log to console for immediate visibility
  console.error('Fatal error:', error);
  process.exit(1);
});
