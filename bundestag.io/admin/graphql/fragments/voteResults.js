import gql from "graphql-tag";

export default gql`
  fragment VoteResults on Procedure {
    voteDate
    customData {
      voteResults {
        yes
        no
        abstination
        decisionText
        votingDocument
        votingRecommendation
        partyVotes {
          party
          main
          deviants {
            yes
            abstination
            no
          }
        }
      }
    }
  }
`;
