import React from "react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { useMemo } from "react";
import { NextApiRequest, NextApiResponse, NextPage } from "next";

export interface GraphQlContext {
  req: NextApiRequest;
  res: NextApiResponse;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createIsomorphicLink(context: GraphQlContext | undefined) {
  /**
   * SSG and SSR
   */
  //   if (typeof window === "undefined") {
  //     const { SchemaLink } = require("@apollo/client/link/schema");
  //     const { graphQlSchema } = require("./schema");
  //     return new SchemaLink({ schema: graphQlSchema, context });
  //   }

  /**
   * Client-side
   */
  const { HttpLink } = require("@apollo/client");
  return new HttpLink({
    uri: "/graphql",
    credentials: "same-origin",
    // headers: {
    //   "bio-auth-token": process.env.BIO_EDIT_TOKEN,
    // },
  });
}

function createApolloClient(context?: GraphQlContext): ApolloClient<any> {
  return new ApolloClient({
    /**
     * Enable SSR mode when not running on the client-side
     */
    ssrMode: typeof window === "undefined",
    link: createIsomorphicLink(context),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(
  initialState: any = null,
  // Pages with Next.js data fetching methods, like `getStaticProps`, can send
  // a custom context which will be used by `SchemaLink` to server render pages
  context?: GraphQlContext
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
  if (typeof window === "undefined") {
    return _apolloClient;
  }

  // Create the Apollo Client once in the client
  apolloClient = apolloClient ?? _apolloClient;

  return apolloClient;
}

export const getApolloClient = initializeApollo;

export function useApollo(initialState: any) {
  const apolloStore = useMemo(
    () => initializeApollo(initialState),
    [initialState]
  );
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
