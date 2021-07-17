import gql from 'graphql-tag';

export default gql`
  query search($term: String!) {
    searchProceduresAutocomplete(term: $term) {
      procedures {
        title
        procedureId
        type
        votes
        communityVotes {
          yes
          no
          abstination
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
          }
        }
        subjectGroups
      }
      autocomplete
    }
  }
`;
