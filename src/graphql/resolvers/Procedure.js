export default {
  Query: {
    getProcedures: (parent, { offset = 0, pageSize = 20 }, { ProcedureModel }) => ProcedureModel.find(),
  },
};
