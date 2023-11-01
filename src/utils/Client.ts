import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import DebounceLink from 'apollo-link-debounce';

export default function getClient() {
  const isServer = typeof window === 'undefined';
  const host = isServer ? process.env.HOSTNAME : window.location.origin;
  const port = isServer ? process.env.PORT : window.location.port;
  const protocol = isServer ? process.env.PROTOCOL : window.location.protocol;
  const url =
    process.env.NODE_ENV === 'production'
      ? `${protocol}://${host}`
      : `${protocol}://${host}:${port}`;

  const link = ApolloLink.from([
    new DebounceLink(100),
    new HttpLink({
      uri: `${url}/api/graphql`,
    }),
  ]);

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          procedures: {
            ...offsetLimitPagination(['filter', 'sort', 'listTypes', 'period']),
          },
        },
      },
    },
  });

  return new ApolloClient({
    cache,
    link,
  });
}
