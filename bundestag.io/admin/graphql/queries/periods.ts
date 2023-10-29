import gql from 'graphql-tag';

export default gql`
  query {
    legislativePeriods {
      number
      deputies
      start
      end
    }
  }
`;
