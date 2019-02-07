import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import cors from 'cors';
import { inspect } from 'util';

// *****************************************************************
// IMPORTANT - you cannot include any models before migrating the DB
// *****************************************************************

import CONSTANTS from './config/constants';

// Allow global Log
import './services/logger';

import connectDB from './services/mongoose';
import migrateDB from './services/migration';

const main = async () => {
  // Connect to DB - this keeps the process running
  // IMPORTANT - This is done before any Model is registered
  await connectDB();

  // Migrate DB if required - can exit the process
  // IMPORTANT - you cannot include any models before finishing this
  //   else every schema including an index will be created in the database
  //   even tho is is quite retarded it is the way it is
  await migrateDB();

  // Express Server
  const server = express();

  // Cors
  server.use(cors());

  // Bodyparser
  server.use(bodyParser.json());

  // Graphql
  // Here several Models are included for graphql
  // if that did not happen in the migration
  const graphql = require('./services/graphql'); // eslint-disable-line global-require
  server.use(CONSTANTS.GRAPHQL_PATH, graphql);

  // Search
  // Procedure Model is included
  const search = require('./services/search'); // eslint-disable-line global-require
  server.get('/search', search);

  // Apollo Engine
  if (CONSTANTS.ENGINE_API_KEY) {
    // No Models are included at current time - just to be sure
    const apolloEngine = require('./services/apolloEngine'); // eslint-disable-line global-require
    server.use(apolloEngine);
  }

  // Graphiql
  if (CONSTANTS.GRAPHIQL_PATH) {
    // No Models are included at current time - just to be sure
    const graphiql = require('./services/graphiql'); // eslint-disable-line global-require
    server.use(CONSTANTS.GRAPHIQL_PATH, graphiql);
  }

  // Create & start Server
  const graphqlServer = createServer(server);
  graphqlServer.listen(CONSTANTS.PORT, err => {
    if (err) {
      Log.error(inspect(err));
    } else {
      Log.info(`App is listen on port: ${CONSTANTS.PORT}`);
    }
  });

  // Start CronJobs (Bundestag Importer)
  // Serveral Models are included
  const cronJobs = require('./services/cronJobs'); // eslint-disable-line global-require
  cronJobs();
};

// Async Wrapping Function
// Catches all errors
(async () => {
  try {
    await main();
  } catch (error) {
    Log.error(error.stack);
  }
})();
