import gql from 'graphql-tag';

export default gql`
  query getVotesRecommendation($decision: String, $period: Int) {
    parseDecision(decision: $decision, period: $period) {
      result {
        votes {
          name
          vote
        }
        votingRecommendation
        votingDocument
      }
    }
  }
`;
