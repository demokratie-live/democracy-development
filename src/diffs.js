/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import diffHistory from 'mongoose-diff-history/diffHistory';
import fs from 'fs-extra';

import './services/logger';

import DB, { mongoose } from './services/mongoose';
import Procedure from './models/Procedure';

(async () => {
  // Start DB Connection
  await DB();
  const History = mongoose.model('History');

  const histories = await History.aggregate([
    { $sort: { version: 1 } },
    { $group: { _id: '$collectionId', procedures: { $push: '$$ROOT' } } },
  ]);
  const promises = histories.map(async procedureHistories => {
    const procedureVersions = procedureHistories.procedures.map(
      async changeset =>
        new Promise(resolve =>
          diffHistory.getVersion(Procedure, changeset.collectionId, changeset.version, (err, obj) =>
            resolve({ obj, changeset }),
          ),
        ),
    );

    return Promise.all([...procedureVersions]).then(async procVers => {
      const procedureVersion = procVers.map(procedure => {
        const tmpProcedure = procedure;
        tmpProcedure.obj.updatedAt = procedure.changeset.updatedAt;
        return tmpProcedure;
      });

      const curProcedure = await Procedure.findById(procedureVersion[0].obj._id);

      let contents = fs.readFileSync('./assets/templates/diff.html', 'utf8');

      contents = contents.replace('###TITLE###', curProcedure.title);
      contents = contents.replace('###ID###', `${curProcedure.period}-${curProcedure.procedureId}`);
      contents = contents.replace(
        '###OBJECTS###',
        JSON.stringify([...procedureVersion.map(ele => ele.obj), curProcedure]),
      );
      contents = contents.replace(
        '###JS###',
        procedureVersion
          .map(
            (obj, index) => `
            var delta = jsondiffpatch.diff(objects[${index}], objects[${index + 1}]);
            console.log(delta)
            document.getElementById('diff-${index}').innerHTML = jsondiffpatch.formatters.html.format(delta, objects[${index}]);
            `,
          )
          .join(''),
      );
      contents = contents.replace(
        '###DIFF_HTML###',
        `<table>${procedureVersion
          .map((obj, index) => `<td id="diff-${index}">Hallo</td>`)
          .join('')}</table>`,
      );
      const directory = `diffs/${curProcedure.period}/${curProcedure.type}`;
      await fs.ensureDir(directory);
      return new Promise(resolve =>
        fs.writeFile(`${directory}/${procedureVersion[0].obj.procedureId}.html`, contents, () => {
          resolve();
        }),
      );
    });
  });
  Promise.all(promises).then(() => mongoose.disconnect());
})();
