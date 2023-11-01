import { createServer } from './services/graphql';
import {
  ProcedureModel,
  UserModel,
  DeputyModel,
  NamedPollModel,
  ConferenceWeekDetailModel,
  PlenaryMinuteModel,
  mongoConnect,
} from '@democracy-deutschland/bundestagio-common';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';

// *****************************************************************
// IMPORTANT - you cannot include any models before migrating the DB
// *****************************************************************

import CONFIG from './config';

// Allow global Log
import './services/logger';

const app = express();
const httpServer = http.createServer(app);
const server = createServer({ httpServer });

const main = async () => {
  // Connect to DB - this keeps the process running
  // IMPORTANT - This is done before any Model is registered
  await mongoConnect();

  await server.start();

  app.get('/health', (req, res) => {
    res.status(200).send('Okay!');
  });

  app.use(
    CONFIG.GRAPHQL_PATH,
    cors<cors.CorsRequest>(),
    // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
    bodyParser.json({ limit: '50mb' }),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      // context: async ({ req }) => ({ token: req.headers.token }),
      context: async ({ req }) => {
        return {
          req,
          // Models
          ProcedureModel,
          UserModel,
          DeputyModel,
          NamedPollModel,
          ConferenceWeekDetailModel,
          PlenaryMinuteModel,
        };
      },
    }),
  );
  await new Promise<void>((resolve) => httpServer.listen({ port: CONFIG.PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${CONFIG.PORT}/`);

  // startStandaloneServer(server, {
  //   listen: {
  //     port: CONFIG.PORT,
  //     path: CONFIG.GRAPHQL_PATH,
  //   },
  //   context: async ({ req }) => {
  //     return {
  //       req,
  //       // Models
  //       ProcedureModel,
  //       UserModel,
  //       DeputyModel,
  //       NamedPollModel,
  //       ConferenceWeekDetailModel,
  //       PlenaryMinuteModel,
  //     };
  //   },
  // });
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
