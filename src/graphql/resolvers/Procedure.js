export default {
  Query: {
    procedures: (parent, args, { ProcedureModel }) => ProcedureModel.find({ type: 'Gesetzgebung' }),
  },
};
