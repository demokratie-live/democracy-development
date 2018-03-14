export default {
  Query: {
    procedures: (parent, { IDs }, { ProcedureModel }) => ProcedureModel.find({ type: 'Gesetzgebung', procedureId: { $in: IDs } }),

    allProcedures: async (parent, args, { ProcedureModel }) =>
      ProcedureModel.find({ type: 'Gesetzgebung', period: { $gte: 18 } }),

    procedureUpdates: async (parent, { period, type }, { ProcedureModel }) =>
      ProcedureModel.find({ type, period }),
  },
};
