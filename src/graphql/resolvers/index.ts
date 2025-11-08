import { mergeResolvers } from '@graphql-tools/merge';
import Activity from './Activity';
import ConferenceWeek from './ConferenceWeek';
import Date from './Date';
import Deputy from './Deputy';
import Device from './Device';
import Procedure from './Procedure';
import SearchTerm from './SearchTerm';
import User from './User';
import Vote from './Vote';

const resolvers = [
  Activity,
  ConferenceWeek,
  Date,
  Deputy,
  Device,
  Procedure,
  SearchTerm,
  User,
  Vote,
];

export default mergeResolvers(resolvers);
