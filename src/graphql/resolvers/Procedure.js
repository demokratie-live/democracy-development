export default {
  Query: {
    procedures: (parent, { offset = 0, pageSize = 20 }, { ProcedureModel }) =>
      ProcedureModel.find({ type: 'Gesetzgebung' }),
  },
};
