export default {
  Query: {
    allprocedures: (parent, args, { ProcedureModel }) =>
      ProcedureModel.find({ type: 'Gesetzgebung' }),
  },
};
