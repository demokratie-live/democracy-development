export default {
  Query: {
    procedures: (
      parent,
      {
        IDs, period = [19], type = ['Gesetzgebung', 'Antrag'], status,
      },
      { ProcedureModel },
    ) => {
      let match = { period: { $in: period }, type: { $in: type } };
      if (status) {
        match = { ...match, currentStatus: { $in: status } };
      }
      if (IDs) {
        match = { ...match, procedureId: { $in: IDs } };
      }
      return ProcedureModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'histories',
            localField: '_id',
            foreignField: 'collectionId',
            as: 'objectHistory',
          },
        },
        {
          $addFields: {
            bioUpdateAt: {
              $max: '$objectHistory.createdAt',
            },
          },
        },
        { $project: { objectHistory: false } },
      ]);
    },

    allProcedures: async (
      parent,
      { period = [19], type = ['Gesetzgebung', 'Antrag'] },
      { ProcedureModel },
    ) =>
      ProcedureModel.aggregate([
        { $match: { period: { $in: period }, type: { $in: type } } },
        {
          $lookup: {
            from: 'histories',
            localField: '_id',
            foreignField: 'collectionId',
            as: 'objectHistory',
          },
        },
        {
          $addFields: {
            bioUpdateAt: {
              $max: '$objectHistory.createdAt',
            },
          },
        },
        { $project: { objectHistory: false } },
      ]),

    procedureUpdates: async (parent, { period, type }, { ProcedureModel }) =>
      ProcedureModel.aggregate([
        { $match: { period: { $in: period }, type: { $in: type } } },
        {
          $lookup: {
            from: 'histories',
            localField: '_id',
            foreignField: 'collectionId',
            as: 'objectHistory',
          },
        },
        {
          $addFields: {
            bioUpdateAt: {
              $max: '$objectHistory.createdAt',
            },
          },
        },
        { $project: { objectHistory: false } },
      ]),
  },
  Mutation: {
    saveProcedureCustomData: async (
      parent,
      { procedureId, partyVotes, decisionText },
      { ProcedureModel },
    ) => {
      // TODO: SECURE THIS FUNCTION
      console.log(partyVotes);
      await ProcedureModel.update(
        { procedureId },
        {
          $set: {
            'customData.voteResults.partyVotes': partyVotes,
            'customData.voteResults.decisionText': decisionText,
          },
        },
      );
      const procedure = await ProcedureModel.findOne({ procedureId });
      console.log(procedure.customData);
      return procedure;
    },
  },
};
