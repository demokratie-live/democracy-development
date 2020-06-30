import { ApolloServer } from 'apollo-server-express';

// Models
import {
  ProcedureModel,
  UserModel,
  DeputyModel,
  NamedPollModel,
  HistoryModel,
  ConferenceWeekDetailModel,
} from '@democracy-deutschland/bundestagio-common';

import typeDefs from '../../graphql/schemas';
import resolvers from '../../graphql/resolvers';
import schemaDirectives from '../../graphql/schemaDirectives';

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
    ConferenceWeekDetailModel,
  }),
});

module.exports = graphiql;
