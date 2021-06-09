import { ApolloServer } from 'apollo-server'

const resolvers = {}
import typeDefs from './schema';
const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
