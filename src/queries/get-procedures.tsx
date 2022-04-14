import { gql } from '@apollo/client';

export const GET_PROCEDURES = gql`
  query procedures(
    $offset: Int
    $pageSize: Int
    $listTypes: [ListType!]
    $sort: String
    $filter: ProcedureFilter
    $period: Int
  ) {
    procedures(
      offset: $offset
      pageSize: $pageSize
      listTypes: $listTypes
      sort: $sort
      filter: $filter
      period: $period
    ) {
      _id
      title
      procedureId
      sessionTOPHeading
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
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
