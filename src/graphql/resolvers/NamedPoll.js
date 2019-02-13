export default {
  Query: {
    namedPoll: async (parent, { webId }, { NamedPollModel }) => NamedPollModel.findOne({ webId }),

    namedPolls: async (parent, { limit = 99, offset = 0 }, { NamedPollModel }) =>
      // Even tho the index for createdAt is set - the memory limit is reached - therefore no sort
      NamedPollModel.find({}, {}, { /* sort: { createdAt: 1 }, */ skip: offset, limit }),

    namedPollUpdates: async (
      parent,
      { since, limit = 99, offset = 0 },
      { NamedPollModel, HistoryModel },
    ) => {
      const beforeCount = await NamedPollModel.count({ createdAt: { $lte: since } });
      const afterCount = await NamedPollModel.count({});
      const changed = await HistoryModel.aggregate([
        {
          $match: {
            collectionName: 'NamedPoll',
            createdAt: { $gt: since },
          },
        },
        { $group: { _id: '$collectionId' } },
      ]);
      const namedPolls = await NamedPollModel.find(
        {
          $or: [{ createdAt: { $gt: since } }, { _id: { $in: changed } }],
        },
        {},
        // Even tho the index for createdAt is set - the memory limit is reached - therefore no sort
        { /* sort: { createdAt: 1 }, */ skip: offset, limit },
      );
      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        changedCount: changed.length,
        namedPolls,
      };
    },
  },
};
