import express from 'express';
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import DipAPI from './DipAPI';
import typeDefs from './schema';
import resolvers from './resolvers';
import stripHTML from './middlewares/stripHTML';
import { applyMiddleware } from 'graphql-middleware';

const middlewares = [stripHTML];

export default function createServer({
  DIP_API_ENDPOINT,
  DIP_API_KEY,
  RATE_LIMIT,
  config,
}: {
  DIP_API_ENDPOINT: string;
  DIP_API_KEY: string;
  RATE_LIMIT: number;
  config?: ApolloServerExpressConfig;
}): { app: express.Express; server: ApolloServer } {
  const schema = applyMiddleware(makeExecutableSchema({ typeDefs, resolvers }), ...middlewares);
  const server = new ApolloServer({
    schema,
    dataSources: () => ({ dipAPI: new DipAPI({ baseURL: DIP_API_ENDPOINT, limit: RATE_LIMIT }) }),
    context: () => ({ DIP_API_KEY }),
    ...config,
  });
  const app = express();
  server.applyMiddleware({ app, path: '/' });
  return { app, server };
}
