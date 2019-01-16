export default {
  Query: {
    deputy: async (parent, { webId }, { DeputyModel }) => DeputyModel.findOne({ webId }),

    deputies: async (parent, { limit = 99, offset = 0 }, { DeputyModel }) =>
      DeputyModel.find({})
        .sort({ createdAt: 1 })
        .skip(offset)
        .limit(limit),

    deputyUpdates: async (
      parent,
      { since, limit = 99, offset = 0 },
      { DeputyModel, HistoryModel },
    ) => {
      const beforeCount = await DeputyModel.count({ createdAt: { $lte: since } });
      const afterCount = await DeputyModel.count({});
      const changed = await HistoryModel.aggregate([
        {
          $match: {
            collectionName: 'Deputy',
            createdAt: { $gt: since },
          },
        },
        { $group: { _id: '$collectionId' } },
      ]);
      const deputies = await DeputyModel.find({
        $or: [{ createdAt: { $gt: since } }, { _id: { $in: changed } }],
      })
        .sort({ createdAt: 1 })
        .skip(offset)
        .limit(limit);
      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        changedCount: changed.length,
        deputies,
      };
    },
  },
};
