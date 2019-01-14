/* eslint-disable no-console */

import express from 'express';
import { CronJob } from 'cron';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { createServer } from 'http';
import { Engine } from 'apollo-engine';
import cors from 'cors';
import { inspect } from 'util';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';

import './services/logger';

import DB from './config/db';
import CONSTANTS from './config/constants';
import typeDefs from './graphql/schemas';
import resolvers from './graphql/resolvers';
import { auth as authDirective } from './graphql/schemaDirectives';

import importJob from './importJob';
import importAgenda from './importAgenda';
import importNamedPolls from './importNamedPolls';

// Models
import ProcedureModel from './models/Procedure';
import UserModel from './models/User';

const main = async () => {
  // Start DB Connection
  await DB();

  const server = express();

  server.use(cors());

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives: {
      auth: authDirective,
    },
  });

  // Apollo Engine
  if (process.env.ENGINE_API_KEY) {
    const engine = new Engine({
      engineConfig: { apiKey: process.env.ENGINE_API_KEY },
    });
    engine.start();
    server.use(engine.expressMiddleware());
  }

  server.use(bodyParser.json());

  server.use(cors());

  // Graphiql
  if (CONSTANTS.GRAPHIQL) {
    server.use(
      CONSTANTS.GRAPHIQL_PATH,
      graphiqlExpress({
        endpointURL: CONSTANTS.GRAPHQL_PATH,
      }),
    );
  }

  // VOYAGER
  if (CONSTANTS.VOYAGER) {
    server.use('/voyager', voyagerMiddleware({ endpointUrl: CONSTANTS.GRAPHQL_PATH }));
  }

  // Graphql
  server.use(CONSTANTS.GRAPHQL_PATH, (req, res, next) => {
    graphqlExpress({
      schema,
      context: {
        req,
        res,
        user: req.user,
        // Models
        ProcedureModel,
        UserModel,
      },
      tracing: true,
      cacheControl: true,
    })(req, res, next);
  });

  server.get('/search', (req, res) => {
    ProcedureModel.search(
      {
        function_score: {
          query: {
            multi_match: {
              query: req.query.s,
              fields: ['title^3', 'tags^2.5', 'abstract^2'],
              fuzziness: 'AUTO',
              prefix_length: 2,
            },
          },
        },
      },
      (err, result) => {
        if (err) {
          Log.error(inspect(err));
        }
        res.send(result);
      },
    );
  });

  // Create & start Server + Cron
  const graphqlServer = createServer(server);
  graphqlServer.listen(CONSTANTS.PORT, err => {
    if (err) {
      Log.error(inspect(err));
    } else {
      Log.info(`App is listen on port: ${CONSTANTS.PORT}`);
      const crons = [
        new CronJob('15 * * * *', importJob, null, true, 'Europe/Berlin', null, true),
        new CronJob('*/15 * * * *', importAgenda, null, true, 'Europe/Berlin', null, true),
        new CronJob('30 * * * *', importNamedPolls, null, true, 'Europe/Berlin', null, true),
      ];
      if (CONSTANTS.DEBUG) {
        Log.info('crons', crons.length);
      }
    }
  });
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
