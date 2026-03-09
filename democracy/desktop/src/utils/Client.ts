import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import DebounceLink from 'apollo-link-debounce';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const getServerHost = () => {
  if (process.env.APP_HOST) {
    return trimTrailingSlashes(process.env.APP_HOST);
  }

  const port = process.env.PORT ?? '3000';

  return `http://127.0.0.1:${port}`;
};

export default function getClient() {
  const isServer = typeof window === 'undefined';
  const host = isServer ? getServerHost() : window.location.origin;
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
