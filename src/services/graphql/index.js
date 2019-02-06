import mongoose from 'mongoose';
import { graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './../../graphql/schemas';
import resolvers from './../../graphql/resolvers';
import { auth } from './../../graphql/schemaDirectives';

// Models
import ProcedureModel from './../../models/Procedure';
import UserModel from './../../models/User';
import DeputyModel from './../../models/Deputy';

const graphql = (req, res, next) => {
  graphqlExpress({
    schema: makeExecutableSchema({
      typeDefs,
      resolvers,
      schemaDirectives: { auth },
    }),
    context: {
      req,
      res,
      user: req.user,
      // Models
      ProcedureModel,
      UserModel,
      DeputyModel,
      HistoryModel: mongoose.model('History'),
    },
    tracing: true,
    cacheControl: true,
  })(req, res, next);
};

module.exports = graphql;
