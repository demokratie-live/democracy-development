import { Resolvers } from './types';

const NamedPollResolvers: Resolvers = {
  Query: {
    namedPoll: async (parent: any, { webId }: any, { NamedPollModel }: any) =>
      NamedPollModel.findOne({ webId }),

    namedPolls: async (parent: any, { limit = 99, offset = 0 }: any, { NamedPollModel }: any) =>
      // Even tho the index for createdAt is set - the memory limit is reached - therefore no sort
      NamedPollModel.find({}, {}, { /* sort: { createdAt: 1 }, */ skip: offset, limit }),

    namedPollUpdates: async (
      parent: any,
      { since, limit = 99, offset = 0, associated = true }: any,
      { NamedPollModel }: any,
    ) => {
      const beforeCount = await NamedPollModel.count({ createdAt: { $lte: since } });
      const afterCount = await NamedPollModel.count({});

      // Build find query for namedPolls
      const namedPollsFindQuery: any = {
        createdAt: { $gt: since },
      };

      // if only return accociated polls do filter
      // without, the api return polls without procedureId
      if (associated) {
        namedPollsFindQuery.procedureId = { $ne: null };
      }

      const namedPolls = await NamedPollModel.find(
        namedPollsFindQuery,
        {},
        // Even tho the index for createdAt is set - the memory limit is reached - therefore no sort
        { /* sort: { createdAt: 1 }, */ skip: offset, limit },
      );
      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        namedPolls,
      };
    },
  },
};

export default NamedPollResolvers;
