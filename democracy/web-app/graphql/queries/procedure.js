import gql from 'graphql-tag';

export default gql`
  query procedure($id: ID!) {
    procedure(id: $id) {
      list
      completed
      title
      procedureId
      type
      votes
      communityVotes {
        yes
        no
        abstination
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
          }
        }
      }
      importantDocuments {
        editor
        type
        url
        number
      }
      currentStatusHistory
    }
  }
`;
