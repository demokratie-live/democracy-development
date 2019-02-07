import { graphiqlExpress } from 'apollo-server-express';
import CONSTANTS from './../../config/constants';

const graphiql = () =>
  graphiqlExpress({
    endpointURL: CONSTANTS.GRAPHQL_PATH,
  });

module.exports = graphiql();
