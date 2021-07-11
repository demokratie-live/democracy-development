import gql from "graphql-tag";

export const VOTE_TEXTS = gql`
  query voteTexts($procedureId: String!) {
    voteResultTextHelper(procedureId: $procedureId) {
      results
    }
  }
`;
