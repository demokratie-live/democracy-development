export default {
  Query: {
    procedures: (parent, { IDs, period = [19], type = ['Gesetzgebung', 'Antrag'] }, { ProcedureModel }) =>
      ProcedureModel.aggregate([
        { $match: { procedureId: { $in: IDs }, period: { $in: period }, type: { $in: type } } },
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

    allProcedures: async (parent, { period = [19], type = ['Gesetzgebung', 'Antrag'] }, { ProcedureModel }) =>
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
};
