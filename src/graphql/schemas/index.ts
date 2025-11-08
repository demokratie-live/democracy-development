import { mergeTypeDefs } from '@graphql-tools/merge';
import Activity from './Activity';
import ConferenceWeek from './ConferenceWeek';
import Deputy from './Deputy';
import Device from './Device';
import Documents from './Documents';
import Procedure from './Procedure';
import Schema from './Schema';
import SearchTerms from './SearchTerms';
import User from './User';
import Vote from './Vote';

const typeDefs = [
  Activity,
  ConferenceWeek,
  Deputy,
  Device,
  Documents,
  Procedure,
  Schema,
  SearchTerms,
  User,
  Vote,
];

export default mergeTypeDefs(typeDefs);
