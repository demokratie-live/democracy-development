import { defaultFieldResolver } from 'graphql';
import { Log } from '../../services/logger';
import { SchemaDirectiveVisitor } from 'apollo-server-express';

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type): void {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();
    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      console.log('ensureFieldsWrapped HIER 2', field);
      field.resolve = async (...args) => {
        console.log('ensureFieldsWrapped HIER 3');
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const [, , context] = args;
        let allow = true;
        if (requiredRole === 'BACKEND') {
          if (
            !context.req.headers['bio-auth-token'] ||
            context.req.headers['bio-auth-token'] !== process.env.BIO_EDIT_TOKEN
          ) {
            Log.warn(
              `Connection to Bio blocked from ${context.req.connection.remoteAddress} for role 'BACKEND'`,
            );
            allow = false;
          }
        }
        if (!allow) {
          throw new Error(`not authorized ${context.req.connection.remoteAddress}`);
        }

        return resolve.apply(this, args);
      };
    });
  }
}

export default AuthDirective;
