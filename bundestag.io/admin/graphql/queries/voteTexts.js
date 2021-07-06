import gql from "graphql-tag";

export default gql`
  query voteTexts($procedureId: String!) {
    voteResultTextHelper(procedureId: $procedureId) {
      results 
    }
  }
`;
