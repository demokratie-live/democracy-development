import gql from 'graphql-tag';

export default gql`
  query DeputyUpdates($since: Date!, $limit: Int, $offset: Int) {
    deputyUpdates(since: $since, limit: $limit, offset: $offset) {
      beforeCount
      afterCount
      newCount
      changedCount
      deputies {
        webId
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
        }
      }
    }
  }
`;
