import { Resolvers } from './types';

const DeputyResolvers: Resolvers = {
  Query: {
    deputy: async (parent, { webId }, { DeputyModel }) => DeputyModel.findOne({ webId }),

    deputies: async (parent, { limit = 99, offset = 0 }, { DeputyModel }) =>
      DeputyModel.find({}, {}, { sort: { createdAt: 1 }, skip: offset, limit }),

    deputyUpdates: async (parent, { since, limit = 99, offset = 0 }, { DeputyModel }) => {
      const beforeCount = await DeputyModel.count({ updatedAt: { $lte: since } });
      const afterCount = await DeputyModel.count({});

      const deputies = await DeputyModel.find(
        {
          updatedAt: { $gt: since },
        },
        {},
        { sort: { updatedAt: 1 }, skip: offset, limit },
      );

      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        deputies,
      };
    },
  },
  Deputy: {
    period: (parent) => (parent as any).toObject().period || 0,
  },
};

export default DeputyResolvers;
