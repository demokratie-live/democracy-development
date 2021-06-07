import gql from "graphql-tag";

import VoteResults from "../fragments/voteResults";

export default gql`
  query procedure($procedureId: String!) {
    procedure(procedureId: $procedureId) {
      procedureId
      title
      currentStatus
      type
      period
      importantDocuments {
        editor
        number
        type
        url
      }
      namedVote
      history {
        assignment
        initiator
        findSpot
        findSpotUrl
        decision {
          type
        }
      }
      ...VoteResults
    }
  }
  ${VoteResults}
`;
