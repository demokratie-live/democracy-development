import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import fetch from "cross-fetch";

const createClient = () =>
  new ApolloClient({
    link: createHttpLink({
      // ssrMode: true,
      uri: process.env.BUNDESTAGIO_SERVER_URL,
      fetch,
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
    },
  });

export default createClient;
