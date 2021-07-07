import React from "react";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import "antd/dist/antd.css";
import { Provider, signIn, useSession } from "next-auth/client";

import "../styles/globals.css";
import { useApollo } from "../lib/apolloClient";

interface AppPropsWithAuth extends AppProps {
  Component: AppProps["Component"] & { auth: { role: string } };
}

function MyApp({ Component, pageProps }: AppPropsWithAuth) {
  const client = useApollo(pageProps.initialApolloState);
  return (
    <Provider session={pageProps.session}>
      <ApolloProvider client={client}>
        <Auth>
          <Component {...pageProps} />
        </Auth>
      </ApolloProvider>
    </Provider>
  );
}

function Auth({ children }) {
  const [session, loading] = useSession();
  const isUser = !!session?.user;

  React.useEffect(() => {
    if (loading) return; // Do nothing while loading
    if (!isUser) signIn(); // If not authenticated, force log in
  }, [isUser, loading]);

  if (isUser) {
    return children;
  }

  return <div>Loading...</div>;
}

export default MyApp;
