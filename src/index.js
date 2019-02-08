/* eslint-disable no-console */

import express from 'express';
import { CronJob } from 'cron';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { inspect } from 'util';

import './services/logger';

import DB, { mongoose } from './config/db';
import CONSTANTS from './config/constants';
import typeDefs from './graphql/schemas';
import resolvers from './graphql/resolvers';
import { AuthDirective } from './graphql/schemaDirectives';

import importProcedures from './importer/importProcedures';
import importAgenda from './importer/importAgenda';
import importNamedPolls from './importer/importNamedPolls';
import importDeputyProfiles from './importer/importDeputyProfiles';

// Models
import ProcedureModel from './models/Procedure';
import UserModel from './models/User';
import DeputyModel from './models/Deputy';

const main = async () => {
  // Start DB Connection
  await DB();

  const server = express();

  server.use(cors());

  // Graphql
  const graphQlServer = new ApolloServer({
    engine: CONSTANTS.ENGINE_API_KEY
      ? {
          apiKey: CONSTANTS.ENGINE_API_KEY,
        }
      : false,
    typeDefs,
    resolvers,
    schemaDirectives: {
      auth: AuthDirective,
    },
    introspection: CONSTANTS.GRAPHIQL,
    playground: CONSTANTS.GRAPHIQL
      ? {
          endpoint: CONSTANTS.GRAPHQL_PATH,
        }
      : false,
    context: ({ req, res }) => ({
      // Connection
      req,
      res,
      // user
      user: req.user,
      // Models
      ProcedureModel,
      UserModel,
      DeputyModel,
      HistoryModel: mongoose.model('History'),
    }),
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
  graphQlServer.applyMiddleware({
    app: server,
    path: CONSTANTS.GRAPHQL_PATH,
  });

  server.listen({ port: CONSTANTS.PORT }, () => {
    Log.info(`App is listen on port: ${CONSTANTS.PORT}`);
    const crons = [
      new CronJob('15 * * * *', importProcedures, null, true, 'Europe/Berlin', null, true),
      new CronJob('*/15 * * * *', importAgenda, null, true, 'Europe/Berlin', null, true),
      new CronJob('30 * * * *', importNamedPolls, null, true, 'Europe/Berlin', null, true),
      new CronJob('30 * * * *', importDeputyProfiles, null, true, 'Europe/Berlin', null, true),
    ];
    if (CONSTANTS.DEBUG) {
      Log.info('crons', crons.length);
    }

    console.log(`🚀 Server ready at http://localhost:${CONSTANTS.PORT}${CONSTANTS.GRAPHQL_PATH}`);
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
