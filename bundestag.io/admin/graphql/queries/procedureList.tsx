import { gql } from '@apollo/client';
import VoteResults from '../fragments/voteResults';

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
        voteDate
        ...VoteResults
      }
    }
  }
  ${VoteResults}
`;

export default proceduresQuery;
