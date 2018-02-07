export default {
  Query: {
    getProcedures: (parent, { offset = 0, pageSize = 20 }, { ProcedureModel }) => {
      console.log('####');
      console.log('offset', offset);
      console.log('pageSize', pageSize);
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return ProcedureModel.aggregate([
        { $match: { 'history.initiator': '2. Beratung' } },
        {
          $addFields: {
            order: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$history',
                    as: 'p',
                    cond: { $eq: ['$$p.initiator', '2. Beratung'] },
                  },
                },
                0,
              ],
            },
          },
        },
        { $sort: { 'order.date': -1 } },
        { $skip: offset },
        { $limit: pageSize },
      ]).then((res) => {
        res.forEach((r, i) => console.log(`${i}: `, r._id));
        return res;
      });
    },
  },
};
