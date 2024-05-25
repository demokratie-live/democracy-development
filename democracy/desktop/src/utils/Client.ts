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
  const host = isServer ? process.env.APP_HOST : window.location.origin;
  const link = ApolloLink.from([
    new DebounceLink(100),
    new HttpLink({
      uri: `${host}/api/graphql`,
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
