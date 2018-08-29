export default {
  Query: {
    legislativePeriods: async (parent, args, { LegislativePeriodModel }) =>
      LegislativePeriodModel.find(),
  },
  Mutation: {},
};
