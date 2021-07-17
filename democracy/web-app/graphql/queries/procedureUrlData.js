import gql from 'graphql-tag';

export default gql`
  query procedureUrlData($id: ID!) {
    procedure(id: $id) {
      title
      procedureId
      type
    }
  }
`;
