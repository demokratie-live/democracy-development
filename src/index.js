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

  // Graphiql Playground
  // Here several Models are included for graphql
  // This must be registered before graphql since it binds on / (default)
  if (CONSTANTS.PLAYGROUND_PATH) {
    const graphiql = require('./services/graphiql'); // eslint-disable-line global-require
    graphiql.applyMiddleware({ app: server, path: CONSTANTS.PLAYGROUND_PATH });
  }

  // Search
  // Procedure Model is included
  // This must be registered before graphql since it binds on / (default)
  const search = require('./services/search'); // eslint-disable-line global-require
  server.get('/search', search);

  // Graphql
  // Here several Models are included for graphql
  const graphql = require('./services/graphql'); // eslint-disable-line global-require
  graphql.applyMiddleware({ app: server, path: CONSTANTS.GRAPHQL_PATH });

  // Create & start Server
  const graphqlServer = createServer(server);
  graphqlServer.listen(CONSTANTS.PORT, err => {
    if (err) {
      Log.error(inspect(err));
    } else {
      Log.warn(`🚀 Server ready at http://localhost:${CONSTANTS.PORT}${CONSTANTS.GRAPHQL_PATH}`);
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
