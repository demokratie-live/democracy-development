import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import DipAPI from './DipAPI'
import typeDefs from './schema';
import resolvers from './resolvers'

export default function createServer({ DIP_API_ENDPOINT, DIP_API_KEY, RATE_LIMIT }: { DIP_API_ENDPOINT: string, DIP_API_KEY: string, RATE_LIMIT: number}) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ dipAPI: new DipAPI({ baseURL: DIP_API_ENDPOINT, limit: RATE_LIMIT }) }),
    context: () => ({ DIP_API_KEY,  }),
  });
  const app = express();
  server.applyMiddleware({ app, path: '/' })
  return { app, server }
}
