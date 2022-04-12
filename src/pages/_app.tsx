import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

import Layout from '@/layout/Layout';

import '../styles/global.css';

const client = new ApolloClient({
  cache: new InMemoryCache(),

  uri: 'https://api.democracy-app.de/',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <RecoilRoot>
    <Layout>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </Layout>
  </RecoilRoot>
);

export default MyApp;
