import { getCurrentConferenceWeek } from '../../data/conference-weeks';
import { Resolvers } from '../../generated/graphql';
import { logger } from '../../services/logger';

const ConferenceWeekApi: Resolvers = {
  Query: {
    currentConferenceWeek: async () => {
      logger.graphql('ConferenceWeek.query.currentConferenceWeek');
      return getCurrentConferenceWeek();
    },
  },
};

export default ConferenceWeekApi;
