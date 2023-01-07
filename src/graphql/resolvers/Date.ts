import GraphQLDate from 'graphql-date';
import { Resolvers } from '../../generated/graphql';

const DateApi: Resolvers = {
  Date: GraphQLDate,
};

export default DateApi;
