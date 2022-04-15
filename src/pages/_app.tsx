import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';

import '../styles/global.css';
import Layout from '@/layout/Layout';
import getClient from '@/utils/Client';
import { Progress } from '@/utils/Progress';

const client = getClient();

Progress.init();

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
