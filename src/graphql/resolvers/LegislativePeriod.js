export default {
  Query: {
    legislativePeriods: async (parent, {}, { LegislativePeriodModel }) => {
      console.log(await LegislativePeriodModel.find());
      return LegislativePeriodModel.find();
    }
  },
  Mutation: {}
};
