import { gql } from "@apollo/client";
import VoteResults from "../fragments/voteResults";

export const SAVE_VOTE_RESULTS = gql`
  mutation saveProcedureCustomData(
    $procedureId: String!
    $partyVotes: [PartyVoteInput!]!
    $decisionText: String!
    $votingDocument: VotingDocument!
    $toggleDecision: Boolean!
  ) {
    saveProcedureCustomData(
      procedureId: $procedureId
      partyVotes: $partyVotes
      decisionText: $decisionText
      votingDocument: $votingDocument
      toggleDecision: $toggleDecision
    ) {
      ...VoteResults
      procedureId
    }
  }
  ${VoteResults}
`;
