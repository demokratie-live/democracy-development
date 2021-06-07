import ConferenceWeekDetail from './ConferenceWeekDetail';
import Date from './Date';
import Deputy from './Deputy';
import NamedPoll from './NamedPoll';
import Procedure from './Procedure';
import _ from 'lodash';

export default _.merge({}, ConferenceWeekDetail, Date, Deputy, NamedPoll, Procedure);
