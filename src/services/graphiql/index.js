import { ApolloServer } from 'apollo-server-express';

import typeDefs from './../../graphql/schemas';
import resolvers from './../../graphql/resolvers';
import schemaDirectives from './../../graphql/schemaDirectives';

// Models
import ProcedureModel from './../../models/Procedure';
import UserModel from './../../models/User';
import DeputyModel from './../../models/Deputy';
import NamedPollModel from './../../models/NamedPoll';
import HistoryModel from './../../models/History';

const graphiql = new ApolloServer({
  engine: false,
  typeDefs,
  resolvers,
  schemaDirectives,
  introspection: true,
  playground: true,
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
    NamedPollModel,
    HistoryModel,
  }),
});

module.exports = graphiql;
