import gql from 'graphql-tag';

const proceduresQuery = gql`
  query procedures($voteDate: [Boolean!]) {
    procedures(voteDate: $voteDate) {
      procedureId
      title
      type
      period
      currentStatus
      importantDocuments {
        type
        editor
        number
        url
      }
      history {
        assignment
        initiator
        findSpot
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
