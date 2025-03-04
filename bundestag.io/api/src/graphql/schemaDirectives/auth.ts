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

const hasPermissions = (context, _role) =>
  context.req.headers['bio-auth-token'] &&
  context.req.headers['bio-auth-token'] === process.env.BIO_EDIT_TOKEN;

export const authDirective = (directiveName: string) => {
  return {
    authDirectiveTypeDefs: directiveTypeDefs,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          // This step is needed to process the enum types before using them
          return type;
        },
        [MapperKind.OBJECT_FIELD](fieldConfig) {
          // For GraphQL v16+, we need a different approach to get directives
          let authDirective;
          try {
            authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
          } catch {
            // If there's an error getting the directive, we try a fallback approach
            const directives = fieldConfig.astNode?.directives || [];
            const directive = directives.find((d) => d.name.value === directiveName);
            if (directive) {
              const requiresArg = directive.arguments?.find((arg) => arg.name.value === 'requires');
              if (requiresArg && requiresArg.value.kind === 'EnumValue') {
                authDirective = { requires: requiresArg.value.value };
              }
            }
          }

          if (authDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = async (parent, args, context, info) => {
              if (!hasPermissions(context, authDirective.requires)) {
                throw new Error('You do not have enough permissions!');
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
