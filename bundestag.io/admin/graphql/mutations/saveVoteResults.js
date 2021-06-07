import gql from "graphql-tag";

import VoteResults from "../fragments/voteResults";

export default gql`

  mutation saveProcedureCustomData(
    $procedureId: String!
    $partyVotes: [PartyVoteInput!]!
    $decisionText: String!
    $votingDocument: VotingDocument!
  ) {
    saveProcedureCustomData(
      procedureId: $procedureId
      partyVotes: $partyVotes
      decisionText: $decisionText
      votingDocument: $votingDocument
    ) {
      ...VoteResults
      procedureId
    }
  }
  ${VoteResults}
`;
