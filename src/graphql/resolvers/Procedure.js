export default {
  Query: {
    procedures: (parent, { IDs }, { ProcedureModel }) => {
      console.log('getProcedures');
      return ProcedureModel.find({ type: 'Gesetzgebung', procedureId: { $in: IDs } });
    },
    allProcedures: async (parent, args, { ProcedureModel }) => ProcedureModel.find({ type: 'Gesetzgebung', period: { $gte: 18 } }),
  },
};
