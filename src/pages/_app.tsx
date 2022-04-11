import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { AppProps } from 'next/app';

import '../styles/global.css';

const client = new ApolloClient({
  cache: new InMemoryCache(),

  uri: 'https://api.democracy-app.de/',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <ApolloProvider client={client}>
    <Component {...pageProps} />
  </ApolloProvider>
);

export default MyApp;
