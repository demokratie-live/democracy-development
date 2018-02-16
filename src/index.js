/* eslint-disable no-console */

import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { createServer } from 'http';
import { Engine } from 'apollo-engine';

import './config/db';
import constants from './config/constants';
import typeDefs from './graphql/schemas';
import resolvers from './graphql/resolvers';

// Models
import ProcedureModel from './models/Procedure';

const app = express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const engine = new Engine({ engineConfig: { apiKey: process.env.ENGINE_API_KEY } });
engine.start();
app.use(engine.expressMiddleware());

app.use(bodyParser.json());

if (process.env.ENVIRONMENT !== 'production') {
  app.use(
    constants.GRAPHIQL_PATH,
    graphiqlExpress({
      endpointURL: constants.GRAPHQL_PATH,
    }),
  );
}

app.use(constants.GRAPHQL_PATH, (req, res, next) => {
  graphqlExpress({
    schema,
    context: {
      // Models
      ProcedureModel,
    },
    tracing: true,
    cacheControl: true,
  })(req, res, next);
});

const graphqlServer = createServer(app);

graphqlServer.listen(constants.PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`App is listen on port: ${constants.PORT}`);
  }
});
