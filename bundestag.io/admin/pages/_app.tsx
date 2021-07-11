import React from "react";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import "antd/dist/antd.css";

import "../styles/globals.css";
import { useApollo } from "../lib/apolloClient";

function MyApp({ Component, pageProps }: AppProps) {
  const client = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
