import React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useMemo } from 'react';
import { NextApiRequest, NextApiResponse, NextPage } from 'next';

export interface GraphQlContext {
  req: NextApiRequest;
  res: NextApiResponse;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createIsomorphicLink(context: GraphQlContext | { headers: any } | undefined) {
  /**
   * SSG and SSR
   */
  //   if (typeof window === "undefined") {
  //     const { SchemaLink } = require("@apollo/client/link/schema");
  //     const { graphQlSchema } = require("./schema");
  //     return new SchemaLink({ schema: graphQlSchema, context });
  //   }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { HttpLink } = require('@apollo/client');

  /**
   * API
   */
  if (typeof window === 'undefined') {
    const headers = context && 'headers' in context && context?.headers ? context.headers : {};
    return new HttpLink({
      uri: process.env.BUNDESTAGIO_SERVER_URL,
      credentials: 'same-origin',
      ...headers,
    });
  }

  /**
   * Client-side
   */
  return new HttpLink({
    uri: '/api/graphql',
    credentials: 'same-origin',
  });
}

function createApolloClient(context?: GraphQlContext | { headers: any }): ApolloClient<any> {
  return new ApolloClient({
    /**
     * Enable SSR mode when not running on the client-side
     */
    ssrMode: typeof window === 'undefined',
    link: createIsomorphicLink(context),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(
  initialState: any = null,
  // Pages with Next.js data fetching methods, like `getStaticProps`, can send
  // a custom context which will be used by `SchemaLink` to server render pages
  context?: GraphQlContext | { headers: any },
): ApolloClient<any> {
  const _apolloClient = apolloClient ?? createApolloClient(context);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }

  /**
   * SSG and SSR
   * Always create a new Apollo Client
   */
  if (typeof window === 'undefined') {
    return _apolloClient;
  }

  // Create the Apollo Client once in the client
  apolloClient = apolloClient ?? _apolloClient;

  return apolloClient;
}

export const getApolloClient = initializeApollo;

export function useApollo(initialState: any) {
  const apolloStore = useMemo(() => initializeApollo(initialState), [initialState]);
  return apolloStore;
}

// eslint-disable-next-line react/display-name
export const withApollo = (Comp: NextPage) => (props: { apolloState: any }) => {
  const apolloStore = useApollo(props.apolloState);
  return (
    <ApolloProvider client={apolloStore}>
      <Comp />
    </ApolloProvider>
  );
};
