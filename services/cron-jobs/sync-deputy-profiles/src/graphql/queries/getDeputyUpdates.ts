import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const getDeputyUpdates: DocumentNode = gql`
  query DeputyUpdates($since: Date!, $limit: Int, $offset: Int) {
    deputyUpdates(since: $since, limit: $limit, offset: $offset) {
      beforeCount
      afterCount
      newCount
      changedCount
      deputies {
        webId
        period
        imgURL
        name
        party
        job
        biography
        constituency
        directCandidate
        office
        links {
          name
          URL
          username
        }
      }
    }
  }
`;
