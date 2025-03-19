import ConferenceWeekDetail from './ConferenceWeekDetail';
import Date from './Date';
import Deputy from './Deputy';
import NamedPoll from './NamedPoll';
import Procedure from './Procedure';
import _ from 'lodash';

const LegislativePeriod = {
  LegislativePeriod: {
    parties: async (legislativePeriod, _, { DeputyModel }) => {
      const deputies = await DeputyModel.find({ period: legislativePeriod.number });
      const parties = deputies.reduce((acc, deputy) => {
        const party = acc.find((p) => p.name === deputy.party);
        if (party) {
          party.deputies.push(deputy);
        } else {
          acc.push({ name: deputy.party, deputies: [deputy] });
        }
        return acc;
      }, []);
      return parties;
    },
  },
};

export default _.merge({}, ConferenceWeekDetail, Date, Deputy, NamedPoll, Procedure, LegislativePeriod);
