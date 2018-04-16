import gql from 'graphql-tag';

export default gql`
  mutation updateJwt($token: String) {
    updateJwt(token: $token) @client
  }
`;
