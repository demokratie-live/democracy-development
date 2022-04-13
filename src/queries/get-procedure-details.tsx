import { gql } from '@apollo/client';

export const GET_PROCEDURE_DETAILS = gql`
  query procedure($id: ID!) {
    procedure(id: $id) {
      list
      completed
      title
      sessionTOPHeading
      procedureId
      type
      votes
      communityVotes {
        yes
        no
        abstination
        __typename
      }
      voteDate
      subjectGroups
      tags
      abstract
      currentStatus
      submissionDate
      voteResults {
        yes
        no
        abstination
        notVoted
        decisionText
        namedVote
        partyVotes {
          main
          party
          deviants {
            yes
            abstination
            no
            notVoted
            __typename
          }
          __typename
        }
        __typename
      }
      importantDocuments {
        editor
        type
        url
        number
        __typename
      }
      currentStatusHistory
      __typename
    }
  }
`;
