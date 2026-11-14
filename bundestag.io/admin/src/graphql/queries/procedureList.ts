import { gql } from '@apollo/client';

// only what the to-do list shows; the detail page loads the rest
const proceduresQuery = gql`
  query procedures($manageVoteDate: Boolean, $limit: Int, $offset: Int, $period: Int!) {
    proceduresData(manageVoteDate: $manageVoteDate, limit: $limit, offset: $offset, period: [$period]) {
      totalCount
      nodes {
        procedureId
        title
        type
        period
        currentStatus
        namedVote
        voteDate
        customData {
          voteResults {
            yes
            no
            abstination
          }
        }
      }
    }
  }
`;

export default proceduresQuery;
