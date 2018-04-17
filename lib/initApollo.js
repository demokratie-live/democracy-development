import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import fetch from 'isomorphic-unfetch';
import { withClientState } from 'apollo-link-state';
import { setContext } from 'apollo-link-context';

import GET_JWT from '../src/graphql/queries/client/jwt';

let apolloClient = null;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch;
}

function create(initialState) {
  const cache = new InMemoryCache().restore(initialState || {});

  const stateLink = withClientState({
    cache,
    resolvers: {
      Mutation: {
        updateJwt: (_, { token }, { cache: proxy }) => {
          const data = {
            jwt: {
              __typename: 'Jwt_Token',
              token,
            },
          };
          proxy.writeData({ data });
          return null;
        },
      },
    },
    defaults: {
      jwt: {
        __typename: 'Jwt_Token',
        token: null,
      },
    },
  });

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // const token = localStorage.getItem('token');
    const {
      jwt: { token },
    } = cache.readQuery({
      query: GET_JWT,
    });
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: ApolloLink.from([
      stateLink,
      authLink,
      new HttpLink({
        uri: '/graphql', // Server URL (must be absolute)
        credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
      }),
    ]),
    cache,
  });
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}
