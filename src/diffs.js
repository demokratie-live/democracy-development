/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import diffHistory from 'mongoose-diff-history/diffHistory';
import jsondiffpatch from 'jsondiffpatch';
import fs from 'fs';

import mongoose from './config/db';
import Procedure from './models/Procedure';

(async () => {
  const History = mongoose.model('History');

  History.find({ collectionId: '5a7b2b2da57539646d01f192' }).then((data) => {
    data.forEach(async (entry) => {
      const procedure = await Procedure.findOne(entry.collectionId);
      console.log(procedure.procedureId);
      console.log(entry.version);
      // jsondiffpatch.formatters.html.format(entry.diff);
      // console.log(jsondiffpatch.formatters.console.format(entry.diff, procedure));
      const html = jsondiffpatch.formatters.html.format(entry.diff, procedure);
      fs.writeFile(`./diffs/${procedure.procedureId}-${entry.version}.html`, html, (err) => {
        if (err) {
          return console.log(err);
        }

        return console.log('The file was saved!');
      });
    });
  });

  const diffObjects = await History.aggregate([
    {
      $group: {
        _id: '$collectionId',
        count: { $sum: 1 },
      },
    },
  ]);

  // console.log(diffObjects);
  const changes = [];
  const promises = [];
  await diffObjects.forEach(async ({ _id, count }) => {
    changes[_id] = {};
    // console.log(`ID: ${_id} ########################################################################`);
    await [...Array(count)].forEach(async (el, index) => {
      // const oldEntry = new Promise((resolve, reject) =>
      //   diffHistory.getVersion(Procedure, _id, index, (err, obj) => {
      //     if (err) {
      //       reject(err);
      //     }
      //     resolve(obj);
      //   })).catch(err => console.log(err));
      // const newEntry = new Promise((resolve, reject) =>
      //   diffHistory.getVersion(Procedure, _id, index + 1, (err, obj) => {
      //     if (err) {
      //       reject(err);
      //     }
      //     resolve(obj);
      //   })).catch(err => console.log(err));
      // Promise.all([oldEntry, newEntry]).then((data) => {
      //   console.log('x', data);
      //   const delta = jsondiffpatch.diff(data[0], data[1]);
      //   console.log('y');
      //   // console.log(delta);
      //   // const html = jsondiffpatch.formatters.html.format(delta, oldEntry);
      //   // console.log('###', html);
      // });
    });
    // console.log(await diffHistory.getHistories('Procedure', _id, ['promulgation', 'history']));
  });

  //   console.log(
  //     diffObjects[0]._id,
  //     await diffHistory.getHistories('Procedure', diffObjects[0]._id, ['promulgation', 'history']),
  //   );
  //   console.log(await History.find({ collectionId: '5a7b2c46a57539646d0201e7' }));
})();
