import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import DebounceLink from 'apollo-link-debounce';

export default function getClient() {
  const link = ApolloLink.from([
    new DebounceLink(100),
    new HttpLink({
      uri: `${
        process.env.NODE_ENV === 'development'
          ? process.env.NEXT_PUBLIC_APP_URL
          : ''
      }/api/graphql`,
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
