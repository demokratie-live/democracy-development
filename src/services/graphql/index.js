import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import CONSTANTS from './../../config/constants';

import typeDefs from './../../graphql/schemas';
import resolvers from './../../graphql/resolvers';
import schemaDirectives from './../../graphql/schemaDirectives';

// Models
import ProcedureModel from './../../models/Procedure';
import UserModel from './../../models/User';
import DeputyModel from './../../models/Deputy';

const graphql = new ApolloServer({
  engine: CONSTANTS.ENGINE_API_KEY
    ? {
        apiKey: CONSTANTS.ENGINE_API_KEY,
      }
    : false,
  typeDefs,
  resolvers,
  schemaDirectives,
  introspection: false,
  playground: false,
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

module.exports = graphql;
