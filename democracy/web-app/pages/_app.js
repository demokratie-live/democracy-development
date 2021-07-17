import App, { Container } from 'next/app';
import React from 'react';
import withApolloClient from '../lib/with-apollo-client';
import { ApolloProvider } from 'react-apollo';

// Context
import { Provider as FilterProvider } from 'Context/filter';
import { Provider as SearchProvider } from 'Context/search';

class MyApp extends App {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <FilterProvider>
            <SearchProvider>
              <Component {...pageProps} />
            </SearchProvider>
          </FilterProvider>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApolloClient(MyApp);

// democracy.de/ -> List
// democracy.de/details/123/Some-Title-From-Bundestag -> Detail
// democracy.de/123/Some-Title-From-Bundestag -> Detail
// democracy.de/123w/Some-Title-From-Bundestag2 -> Detail
// /gesetz/893842/Some-Title
// /antrag/234234/Some-Title
