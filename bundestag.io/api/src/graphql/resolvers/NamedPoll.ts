import { Resolvers } from './types';

const NamedPollResolvers: Resolvers = {
  Query: {
    namedPoll: async (_parent, { webId }, { NamedPollModel }) => {
      const poll = await NamedPollModel.findOne({ webId });
      return poll ? { ...poll.toObject(), _id: poll._id.toString() } : null;
    },
    namedPolls: async (_parent, { limit = 99, offset = 0 }, { NamedPollModel }) => {
      const polls = await NamedPollModel.find({}, {}, { skip: offset, limit });
      return polls.map((poll) => ({ ...poll.toObject(), _id: poll._id.toString() }));
    },
    namedPollUpdates: async (
      _parent,
      { since, limit = 99, offset = 0, associated = true },
      { NamedPollModel },
    ) => {
      const findQuery = associated ? { procedureId: { $ne: null } } : {};
      const beforeCount = await NamedPollModel.count({
        ...findQuery,
        createdAt: { $lte: since },
      });
      const afterCount = await NamedPollModel.count(findQuery);

      const polls = await NamedPollModel.find(
        {
          ...findQuery,
          createdAt: { $gt: since },
        },
        {},
        { skip: offset, limit },
      );

      return {
        beforeCount,
        afterCount,
        newCount: afterCount - beforeCount,
        namedPolls: polls.map((poll) => ({ ...poll.toObject(), _id: poll._id.toString() })),
      };
    },
  },
};

export default NamedPollResolvers;
