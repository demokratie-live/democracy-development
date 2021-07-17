import gql from 'graphql-tag';

export default gql`
  query procedures(
    $offset: Int
    $pageSize: Int
    $listTypes: [ListType!]
    $sort: String
    $filter: ProcedureFilter
  ) {
    procedures(
      offset: $offset
      pageSize: $pageSize
      listTypes: $listTypes
      sort: $sort
      filter: $filter
    ) {
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
      currentStatus
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
    }
  }
`;
