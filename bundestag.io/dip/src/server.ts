import { ApolloServer } from 'apollo-server'
import DipAPI from './DipAPI'
import typeDefs from './schema';
import resolvers from './resolvers'

export default function server({ DIP_API_ENDPOINT, DIP_API_KEY}: { DIP_API_ENDPOINT: string, DIP_API_KEY: string}) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ dipAPI: new DipAPI({ baseURL: DIP_API_ENDPOINT}) }),
    context: () => ({ DIP_API_KEY })
  });
}
