import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import expressStatusMonitor from 'express-status-monitor';
import { graphql } from './services/graphql';
import packageJson from '../package.json';

console.info(`Bundestag.io v${packageJson.version}`);

// *****************************************************************
// IMPORTANT - you cannot include any models before migrating the DB
// *****************************************************************

import CONFIG from './config';

// Allow global Log
import './services/logger';

import connectDB from './services/mongoose';
import { Log } from './services/logger';
// import migrateDB from './services/migration';

const main = async () => {
  // Connect to DB - this keeps the process running
  // IMPORTANT - This is done before any Model is registered
  await connectDB();

  // Migrate DB if required - can exit the process
  // IMPORTANT - you cannot include any models before finishing this
  //   else every schema including an index will be created in the database
  //   even tho is is quite retarded it is the way it is
  // await migrateDB();

  // Express Server
  const server = express();

  if (process.env.EXPRESS_STATUS === 'true') {
    server.use(expressStatusMonitor()); // eslint-disable-line global-require
  }

  // Cors
  server.use(cors());

  // Bodyparser
  server.use(bodyParser.json());

  // Graphql
  // Here several Models are included for graphql
  graphql.applyMiddleware({ app: server, path: CONFIG.GRAPHQL_PATH });

  // Start Server
  server.listen({ port: CONFIG.PORT }, () => {
    Log.warn(
      `🚀  Bundestag.io Server ready at http://localhost:${CONFIG.PORT}${CONFIG.GRAPHQL_PATH}`,
    );
  });
};

// Async Wrapping Function
// Catches all errors
(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error.stack);
  }
})();
