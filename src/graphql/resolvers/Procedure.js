export default {
  Query: {
    procedures: (parent, { IDs }, { ProcedureModel }) =>
      ProcedureModel.find({ type: 'Gesetzgebung', procedureId: { $in: IDs } }),
    allProcedures: (parent, args, { ProcedureModel }) =>
      ProcedureModel.find({ type: 'Gesetzgebung' }),
  },
};
