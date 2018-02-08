/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import diffHistory from 'mongoose-diff-history/diffHistory';
import fs from 'fs-extra';

import mongoose from './config/db';
import Procedure from './models/Procedure';

(async () => {
  const History = mongoose.model('History');

  const histories = await History.aggregate([
    { $sort: { version: 1 } },
    { $group: { _id: '$collectionId', procedures: { $push: '$$ROOT' } } },
  ]);
  histories.forEach((procedureHistories) => {
    const procedureVersions = procedureHistories.procedures.map(async changeset =>
      new Promise(resolve =>
        diffHistory.getVersion(Procedure, changeset.collectionId, changeset.version, (err, obj) =>
          resolve({ obj, changeset }))));

    Promise.all([...procedureVersions]).then(async (procVers) => {
      const procedureVersion = procVers.map((procedure) => {
        const tmpProcedure = procedure;
        tmpProcedure.obj.updatedAt = procedure.changeset.updatedAt;
        return tmpProcedure;
      });

      const curProcedure = await Procedure.findById(procedureVersion[0].obj._id);
      console.log(curProcedure);

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
          .map((obj, index) => `
            var delta = jsondiffpatch.diff(objects[${index}], objects[${index + 1}]);
            console.log(delta)
            document.getElementById('diff-${index}').innerHTML = jsondiffpatch.formatters.html.format(delta, objects[${index}]);
            `)
          .join(''),
      );
      contents = contents.replace(
        '###DIFF_HTML###',
        `<table>${procedureVersion
          .map((obj, index) => `<td id="diff-${index}">Hallo</td>`)
          .join('')}</table>`,
      );
      // console.log(contents);
      const directory = `diffs/${curProcedure.period}/${curProcedure.type}`;
      await fs.ensureDir(directory);
      fs.writeFile(`${directory}/${procedureVersion[0].obj.procedureId}.html`, contents, () => {});
    });
  });
})();
