import { ApolloServer } from 'apollo-server'
import { DIP_API_KEY, PORT } from './config'
import DipAPI from './DipAPI'
import typeDefs from './schema';
import resolvers from './resolvers'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({ dipAPI: new DipAPI() }),
  context: () => ({ DIP_API_KEY })
});
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
