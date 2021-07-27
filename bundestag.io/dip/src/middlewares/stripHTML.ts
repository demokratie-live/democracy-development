import { striptags } from 'striptags';
import { IMiddlewareFunction } from 'graphql-middleware';

const stripHTML: IMiddlewareFunction = async (resolve, parent, args, context, info) => {
  const unescaped = await resolve(parent, args, context, info);
  if (!unescaped) return unescaped;
  return striptags(unescaped);
};

export default {
  ProcessFlow: {
    abstract: stripHTML,
  },
  Procedure: {
    abstract: stripHTML,
  },
};
