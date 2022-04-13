import { ApolloClient, InMemoryCache } from '@apollo/client';

export default function getClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),

    uri: 'https://api.democracy-app.de/',
  });
}
