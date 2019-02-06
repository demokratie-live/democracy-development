import { graphiqlExpress } from 'apollo-server-express';
import CONSTANTS from './../../config/constants';

export default () =>
  graphiqlExpress({
    endpointURL: CONSTANTS.GRAPHQL_PATH,
  });
