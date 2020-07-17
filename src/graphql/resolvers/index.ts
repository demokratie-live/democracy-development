import { mergeResolvers } from 'merge-graphql-schemas';
import ConferenceWeekDetail from './ConferenceWeekDetail';
import Date from './Date';
import Deputy from './Deputy';
import NamedPoll from './NamedPoll';
import Procedure from './Procedure';

// const resolversArray = fileLoader(path.join(__dirname, './'), { extensions: ['.js'] });
const resolversArray = [ConferenceWeekDetail, Date, Deputy, NamedPoll, Procedure];

export default mergeResolvers(resolversArray);
