import { gql } from '@apollo/client';

export const SEARCH_PROCEDURES = gql`
  query search($term: String!) {
    searchProceduresAutocomplete(term: $term) {
      procedures {
        _id
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
        currentStatus
        voteDate
        voteResults {
          yes
          no
          abstination
          notVoted
          namedVote
          partyVotes {
            main
            __typename
          }
          __typename
        }
        subjectGroups
        __typename
      }
      autocomplete
      __typename
    }
  }
`;
