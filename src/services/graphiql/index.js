import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';

import typeDefs from './../../graphql/schemas';
import resolvers from './../../graphql/resolvers';
import schemaDirectives from './../../graphql/schemaDirectives';

// Models
import ProcedureModel from './../../models/Procedure';
import UserModel from './../../models/User';
import DeputyModel from './../../models/Deputy';

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
    HistoryModel: mongoose.model('History'),
  }),
});

module.exports = graphiql;
