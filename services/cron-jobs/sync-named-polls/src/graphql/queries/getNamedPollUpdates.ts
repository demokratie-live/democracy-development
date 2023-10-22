import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const namedPollUpdates: DocumentNode = gql`
  query NamedPollUpdates($since: Date!, $limit: Int, $offset: Int, $associated: Boolean) {
    namedPollUpdates(since: $since, limit: $limit, offset: $offset, associated: $associated) {
      beforeCount
      afterCount
      newCount
      changedCount
      namedPolls {
        procedureId
        votes {
          deputies {
            webId
            vote
          }
          inverseVoteDirection
        }
      }
    }
  }
`;
