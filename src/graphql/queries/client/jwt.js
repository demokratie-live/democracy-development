import gql from 'graphql-tag';

export default gql`
  {
    jwt @client {
      token
    }
  }
`;
