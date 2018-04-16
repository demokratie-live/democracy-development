import gql from 'graphql-tag';

export default gql`
  mutation signIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      email
      role
      jwt
    }
  }
`;
