import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import DebounceLink from 'apollo-link-debounce';

export default function getClient() {
  const link = ApolloLink.from([
    new DebounceLink(100),
    new HttpLink({ uri: 'https://api.democracy-app.de/' }),
  ]);

  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
}
