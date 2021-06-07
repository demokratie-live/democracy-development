import gql from "graphql-tag";

import VoteResults from "../fragments/voteResults";

export default gql`
  query {
    legislativePeriods {
      number
      deputies
      start
      end
    }
  }
`;
