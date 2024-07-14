/* eslint-disable @typescript-eslint/no-var-requires */
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
    server.use(require('express-status-monitor')()); // eslint-disable-line global-require
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
  const graphql = require('./services/graphql'); // eslint-disable-line global-require
  graphql.applyMiddleware({ app: server, path: CONFIG.GRAPHQL_PATH });

  // Start Server
  server.listen({ port: CONFIG.PORT }, () => {
    logger.info(`🚀 Server ready at http://localhost:${CONFIG.PORT}${CONFIG.GRAPHQL_PATH}`, {
      metaKey: 'metaValue',
    });
  });

  // Start CronJobs (Bundestag Importer)
  // Serveral Models are included
  const cronJobs = require('./services/cronJobs'); // eslint-disable-line global-require
  cronJobs();
};

// Async Wrapping Function
// Catches all errors
(async () => {
  await main();
})().catch((error) => {
  logger.error('Error in main async function', { error });
  process.exit(1);
});
