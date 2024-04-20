import React from 'react';
import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import { SessionProvider, signIn, useSession } from 'next-auth/react';

import '../styles/globals.css';
import { useApollo } from '../lib/apolloClient';

interface AppPropsWithAuth extends AppProps {
  Component: AppProps['Component'] & { auth: { role: string } };
}

function MyApp({ Component, pageProps }: AppPropsWithAuth) {
  const client = useApollo(pageProps.initialApolloState);
  return (
    <SessionProvider session={pageProps.session}>
      <ApolloProvider client={client}>
        <Auth>
          <Component {...pageProps} />
        </Auth>
      </ApolloProvider>
    </SessionProvider>
  );
}

function Auth({ children }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
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
