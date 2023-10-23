import { ApolloServer } from '@apollo/server';
import { GraphQlContext } from '../../types/graphqlContext';
import { authDirective } from '../../graphql/schemaDirectives/auth';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as typeDefsBase } from '../../generated/graphql';
import resolvers from '../../graphql/resolvers';
import { mergeTypeDefs } from '@graphql-tools/merge';

const typeDefsAuth = authDirective('auth').authDirectiveTypeDefs;

const typeDefs = mergeTypeDefs([typeDefsBase, typeDefsAuth]);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const server = new ApolloServer<GraphQlContext>({
  schema: authDirective('auth').authDirectiveTransformer(schema),
  // schema,
  introspection: true,
});
