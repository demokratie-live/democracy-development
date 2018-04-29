import gql from 'graphql-tag';

const proceduresQuery = gql`
  query procedures($status: [String!]) {
    procedures(status: $status) {
      procedureId
      title
      type
      period
      currentStatus
      history {
        assignment
        initiator
        findSpotUrl
        decision {
          type
        }
      }
      customData {
        voteResults {
          yes
          no
          abstination
          decisionText
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
  }
`;

export default proceduresQuery;
