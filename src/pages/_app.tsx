import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { AppProps } from 'next/app';

import Layout from '@/layout/Layout';

import '../styles/global.css';

const client = new ApolloClient({
  cache: new InMemoryCache(),

  uri: 'https://api.democracy-app.de/',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  </Layout>
);

export default MyApp;
