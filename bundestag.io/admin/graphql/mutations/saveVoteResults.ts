import { gql } from "@apollo/client";
import VoteResults from "../fragments/voteResults";

export const SAVE_VOTE_RESULTS = gql`

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
