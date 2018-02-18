export default {
  Query: {
    procedures: (parent, { IDs }, { ProcedureModel }) => {
      console.log('getProcedures');
      return ProcedureModel.find({ type: 'Gesetzgebung', procedureId: { $in: IDs } });
    },
    allProcedures: async (parent, args, { ProcedureModel }) => {
      console.log(await ProcedureModel.find({ type: 'Gesetzgebung' }).count());
      return ProcedureModel.find({ type: 'Gesetzgebung' });
    },
  },
};
