import diffHistory from 'mongoose-diff-history/diffHistory';
import mongoose from './config/db';

(async () => {
  const History = mongoose.model('History');
  const diffObjects = await History.aggregate([
    {
      $group: {
        _id: '$collectionId',
      },
    },
  ]);
  diffObjects.forEach(async ({ _id }) => {
    console.log(await diffHistory.getHistories('Procedure', _id, ['promulgation', 'history']));
  });

  //   console.log(
  //     diffObjects[0]._id,
  //     await diffHistory.getHistories(
  //      'Procedure',
  //      diffObjects[0]._id,
  //      ['promulgation', 'history']),
  //   );
  //   console.log(await History.find({ collectionId: '5a7b2c46a57539646d0201e7' }));
})();
