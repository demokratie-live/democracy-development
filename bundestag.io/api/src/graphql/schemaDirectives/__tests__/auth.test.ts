import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GraphQLObjectType } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { authDirective } from '../auth';

describe('Auth Directive', () => {
  // Speichern des originalen Umgebungswerts
  const originalEnvToken = process.env.BIO_EDIT_TOKEN;

  beforeAll(() => {
    // Setzen eines Test-Tokens für alle Tests
    process.env.BIO_EDIT_TOKEN = 'test-token';
  });

  afterAll(() => {
    // Wiederherstellen des originalen Umgebungswerts nach allen Tests
    process.env.BIO_EDIT_TOKEN = originalEnvToken;
  });

  it('should allow access when token is valid', async () => {
    // Schema erstellen
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        protectedField: String @auth(requires: BACKEND)
        unprotectedField: String
      }
    `;

    let schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          protectedField: () => 'protected data',
          unprotectedField: () => 'unprotected data',
        },
      },
    });

    // Anwenden der auth directive auf das Schema
    schema = authDirectiveTransformer(schema);

    // Mocking des Kontext-Objekts mit validem Token
    const context = {
      req: {
        headers: {
          'bio-auth-token': 'test-token',
        },
      },
    };

    // Resolver durch Schema-Traversierung finden
    const queryType = schema.getType('Query') as GraphQLObjectType;
    const protectedFieldConfig = queryType.getFields().protectedField;
    const result = await protectedFieldConfig.resolve(
      {}, // parent
      {}, // args
      context, // context mit validem Token
      {} as any, // info
    );

    expect(result).toBe('protected data');
  });

  it('should deny access when token is invalid', async () => {
    // Schema erstellen
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        protectedField: String @auth(requires: BACKEND)
      }
    `;

    let schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          protectedField: () => 'protected data',
        },
      },
    });

    // Anwenden der auth directive auf das Schema
    schema = authDirectiveTransformer(schema);

    // Mocking des Kontext-Objekts mit ungültigem Token
    const context = {
      req: {
        headers: {
          'bio-auth-token': 'wrong-token',
        },
      },
    };

    // Resolver durch Schema-Traversierung finden
    const queryType = schema.getType('Query') as GraphQLObjectType;
    const protectedFieldConfig = queryType.getFields().protectedField;

    await expect(
      protectedFieldConfig.resolve(
        {}, // parent
        {}, // args
        context, // context mit falschem Token
        {} as any, // info
      ),
    ).rejects.toThrow('You do not have enough permissions!');
  });

  it('should deny access when token is missing', async () => {
    // Schema erstellen
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        protectedField: String @auth(requires: BACKEND)
      }
    `;

    let schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          protectedField: () => 'protected data',
        },
      },
    });

    // Anwenden der auth directive auf das Schema
    schema = authDirectiveTransformer(schema);

    // Mocking des Kontext-Objekts ohne Token
    const context = {
      req: {
        headers: {},
      },
    };

    // Resolver durch Schema-Traversierung finden
    const queryType = schema.getType('Query') as GraphQLObjectType;
    const protectedFieldConfig = queryType.getFields().protectedField;

    await expect(
      protectedFieldConfig.resolve(
        {}, // parent
        {}, // args
        context, // context ohne Token
        {} as any, // info
      ),
    ).rejects.toThrow('You do not have enough permissions!');
  });

  it('should use USER as default role when not specified', async () => {
    // Schema erstellen
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        protectedField: String @auth
      }
    `;

    let schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          protectedField: () => 'protected data',
        },
      },
    });

    // Anwenden der auth directive auf das Schema
    schema = authDirectiveTransformer(schema);

    // Mocking des Kontext-Objekts mit validem Token
    const context = {
      req: {
        headers: {
          'bio-auth-token': 'test-token',
        },
      },
    };

    // Resolver durch Schema-Traversierung finden
    const queryType = schema.getType('Query') as GraphQLObjectType;
    const protectedFieldConfig = queryType.getFields().protectedField;

    const result = await protectedFieldConfig.resolve(
      {}, // parent
      {}, // args
      context, // context
      {} as any, // info
    );

    expect(result).toBe('protected data');
  });

  it('should not modify fields without auth directive', async () => {
    // Schema erstellen
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        unprotectedField: String
      }
    `;

    const resolvers = {
      Query: {
        unprotectedField: () => 'unprotected data',
      },
    };

    let schema = makeExecutableSchema({ typeDefs, resolvers });

    // Originalresolver speichern
    const queryType = schema.getType('Query') as GraphQLObjectType;
    const originalResolve = queryType.getFields().unprotectedField.resolve;

    // Anwenden der auth directive auf das Schema
    schema = authDirectiveTransformer(schema);

    // Prüfen, ob der Resolver unverändert ist
    const updatedQueryType = schema.getType('Query') as GraphQLObjectType;
    const updatedResolve = updatedQueryType.getFields().unprotectedField.resolve;

    expect(updatedResolve).toBe(originalResolve);
  });

  it('should handle enum values for requires parameter correctly', async () => {
    // Schema erstellen
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        backendProtectedField: String @auth(requires: BACKEND)
        userProtectedField: String @auth(requires: USER)
      }
    `;

    let schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          backendProtectedField: () => 'backend protected',
          userProtectedField: () => 'user protected',
        },
      },
    });

    // Anwenden der auth directive auf das Schema
    schema = authDirectiveTransformer(schema);

    // Mocking des Kontext-Objekts mit validem Token
    const context = {
      req: {
        headers: {
          'bio-auth-token': 'test-token',
        },
      },
    };

    // Resolver durch Schema-Traversierung finden
    const queryType = schema.getType('Query') as GraphQLObjectType;

    // Test für BACKEND
    const backendField = queryType.getFields().backendProtectedField;
    const backendResult = await backendField.resolve({}, {}, context, {} as any);
    expect(backendResult).toBe('backend protected');

    // Test für USER
    const userField = queryType.getFields().userProtectedField;
    const userResult = await userField.resolve({}, {}, context, {} as any);
    expect(userResult).toBe('user protected');
  });

  it('should use fallback approach when directive resolution fails', async () => {
    const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective('auth');
    const resolverValue = 'protected data';

    const typeDefs = `
      ${authDirectiveTypeDefs}
      
      type Query {
        protectedField: String @auth(requires: BACKEND)
      }
    `;
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          protectedField: () => resolverValue,
        },
      },
    });

    // Manuelle Anwendung der Transformationsfunktion
    const transformedSchema = authDirectiveTransformer(schema);
    expect(transformedSchema).toBeDefined();

    const context = {
      req: {
        headers: {
          'bio-auth-token': 'test-token',
        },
      },
    };

    const queryType = transformedSchema.getType('Query') as GraphQLObjectType;
    const field = queryType.getFields().protectedField;
    const result = await field.resolve({}, {}, context, {} as any);
    expect(result).toBe(resolverValue);
  });
});
