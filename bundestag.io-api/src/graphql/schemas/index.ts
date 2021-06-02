import { mergeTypes } from 'merge-graphql-schemas';
import AuthDirective from './directives/auth';
import ConferenceWeekDetail from './ConferenceWeekDetail';
import Decision from './Decision';
import Deputy from './Deputy';
import Document from './Document';
import Fraction from './Fraction';
import LegislativePeriod from './LegislativePeriod';
import NamedPoll from './NamedPoll';
import Procedure from './Procedure';
import ProcessFlow from './ProcessFlow';
import Schema from './Schema';
import User from './User';

const typesArray = [
  AuthDirective,
  ConferenceWeekDetail,
  Decision,
  Deputy,
  Document,
  Fraction,
  LegislativePeriod,
  NamedPoll,
  Procedure,
  ProcessFlow,
  Schema,
  User,
];

export default mergeTypes(typesArray);
