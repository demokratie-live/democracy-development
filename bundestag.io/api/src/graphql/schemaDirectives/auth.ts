import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';

const directiveTypeDefs = `
directive @auth( 
    requires: Role = USER 
) on FIELD_DEFINITION 

enum Role { 
    BACKEND 
    USER 
}
`;

const hasPermissions = (context, role) =>
  context.req.headers['bio-auth-token'] &&
  context.req.headers['bio-auth-token'] === process.env.BIO_EDIT_TOKEN;

export const authDirective = (directiveName: string) => {
  return {
    authDirectiveTypeDefs: directiveTypeDefs,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD](fieldConfig) {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
          if (authDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            console.log(authDirective);
            const { requires } = authDirective;
            fieldConfig.resolve = async (parent, args, context, info) => {
              console.log(hasPermissions(context, requires));
              if (!hasPermissions(context, requires)) {
                throw new Error('You have not enough permissions!');
              }
              const result = await resolve(parent, args, context, info);
              return result;
            };
            return fieldConfig;
          }
        },
      }),
  };
};
