import { ApolloServer } from '@apollo/server';
import { GraphQlContext } from '../../types/graphqlContext';
import { authDirective } from '../../graphql/schemaDirectives/auth';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as typeDefsBase } from '../../generated/graphql';
import resolvers from '../../graphql/resolvers';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

const { authDirectiveTypeDefs, authDirectiveTransformer, assertAuthDirectiveApplied } =
  authDirective('auth');

const typeDefs = mergeTypeDefs([typeDefsBase, authDirectiveTypeDefs]);

export const buildSchema = () =>
  authDirectiveTransformer(makeExecutableSchema({ typeDefs, resolvers }));

export const createServer = ({ httpServer }) =>
  new ApolloServer<GraphQlContext>({
    schema: assertAuthDirectiveApplied(buildSchema()),
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
