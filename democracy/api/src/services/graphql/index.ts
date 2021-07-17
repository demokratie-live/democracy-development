import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import { applyMiddleware } from 'graphql-middleware';
import CONFIG from '../../config';
import { ExpressReqContext } from '../../types/graphqlContext';

import typeDefs from '../../graphql/schemas';
import resolvers from '../../graphql/resolvers';
import { permissions } from '../../express/auth/permissions';
import DataLoader from 'dataloader';
import { votedLoader } from '../../graphql/resolvers/dataLoaders';

// Models
import {
  ProcedureModel,
  UserModel,
  DeviceModel,
  PushNotificationModel,
  VoteModel,
  PhoneModel,
  VerificationModel,
  ActivityModel,
  SearchTermModel,
  DeputyModel,
} from '@democracy-deutschland/democracy-common';
import { Types } from 'mongoose';

const schema = makeExecutableSchema({ typeDefs, resolvers });

const graphql = new ApolloServer({
  uploads: false,
  engine: CONFIG.ENGINE_API_KEY
    ? {
        apiKey: CONFIG.ENGINE_API_KEY,
        // Send params and headers to engine
        privateVariables: !CONFIG.ENGINE_DEBUG_MODE,
        privateHeaders: !CONFIG.ENGINE_DEBUG_MODE,
      }
    : false,
  typeDefs,
  schema: applyMiddleware(schema, permissions),
  resolvers,
  introspection: true,
  playground: CONFIG.GRAPHIQL,
  context: ({ req, res }: { req: ExpressReqContext; res: Express.Response }) => ({
    // Connection
    res,
    // user
    user: req.user,
    device: req.device,
    phone: req.phone,
    // Models
    ProcedureModel,
    UserModel,
    DeviceModel,
    PhoneModel,
    VerificationModel,
    ActivityModel,
    VoteModel,
    PushNotificationModel,
    SearchTermModel,
    DeputyModel,
    votedLoader: new DataLoader<Types.ObjectId, boolean, unknown>((procedureObjIds) =>
      votedLoader({ procedureObjIds, device: req.device, phone: req.phone }),
    ),
  }),
  tracing: CONFIG.DEBUG,
});

module.exports = graphql;
