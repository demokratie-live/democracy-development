import { createHash, timingSafeEqual } from 'crypto';
import {
  ConstDirectiveNode,
  defaultFieldResolver,
  GraphQLFieldResolver,
  GraphQLSchema,
  isObjectType,
  Kind,
} from 'graphql';
import { MapperKind, mapSchema } from '@graphql-tools/utils';

const directiveTypeDefs = `
directive @auth(
    requires: Role = USER
) on FIELD_DEFINITION

enum Role {
    BACKEND
    USER
}
`;

const ROLES = ['BACKEND', 'USER'];

const protectedResolvers = new WeakSet<GraphQLFieldResolver<unknown, unknown>>();

const digest = (value: string) => createHash('sha256').update(value).digest();

const hasPermissions = (context, _role) => {
  const token = context?.req?.headers?.['bio-auth-token'];
  const expected = process.env.BIO_EDIT_TOKEN;
  if (typeof token !== 'string' || !expected) {
    return false;
  }
  return timingSafeEqual(digest(token), digest(expected));
};

const findDirective = (
  directives: readonly ConstDirectiveNode[] | undefined,
  directiveName: string,
) => directives?.find((d) => d.name.value === directiveName);

// The generated typeDefs print enum arguments as strings, so both kinds are accepted
const getRequiredRole = (directive: ConstDirectiveNode, fieldName: string) => {
  const requiresArg = directive.arguments?.find((arg) => arg.name.value === 'requires');
  if (!requiresArg) {
    return 'USER';
  }
  const { value } = requiresArg;
  if ((value.kind === Kind.ENUM || value.kind === Kind.STRING) && ROLES.includes(value.value)) {
    return value.value;
  }
  throw new Error(`Invalid role in @${directive.name.value} on ${fieldName}`);
};

// Throws if any field annotated with the directive is not guarded
const assertDirectiveApplied = (schema: GraphQLSchema, directiveName: string) => {
  const unguarded: string[] = [];
  Object.values(schema.getTypeMap()).forEach((type) => {
    if (!isObjectType(type)) {
      return;
    }
    Object.values(type.getFields()).forEach((field) => {
      if (
        findDirective(field.astNode?.directives, directiveName) &&
        !protectedResolvers.has(field.resolve)
      ) {
        unguarded.push(`${type.name}.${field.name}`);
      }
    });
  });
  if (unguarded.length) {
    throw new Error(`@${directiveName} is not applied to: ${unguarded.join(', ')}`);
  }
  return schema;
};

export const authDirective = (directiveName: string) => {
  return {
    authDirectiveTypeDefs: directiveTypeDefs,
    assertAuthDirectiveApplied: (schema: GraphQLSchema) =>
      assertDirectiveApplied(schema, directiveName),
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      assertDirectiveApplied(
        mapSchema(schema, {
          [MapperKind.OBJECT_FIELD](fieldConfig, fieldName, typeName) {
            const directive = findDirective(fieldConfig.astNode?.directives, directiveName);
            if (!directive) {
              return fieldConfig;
            }

            const requires = getRequiredRole(directive, `${typeName}.${fieldName}`);
            const { resolve = defaultFieldResolver } = fieldConfig;
            const guardedResolve: GraphQLFieldResolver<unknown, unknown> = async (
              parent,
              args,
              context,
              info,
            ) => {
              if (!hasPermissions(context, requires)) {
                throw new Error('You do not have enough permissions!');
              }
              return resolve(parent, args, context, info);
            };
            protectedResolvers.add(guardedResolve);
            fieldConfig.resolve = guardedResolve;
            return fieldConfig;
          },
        }),
        directiveName,
      ),
  };
};
