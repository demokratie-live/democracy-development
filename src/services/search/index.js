import { inspect } from 'util';

// Models
import { ProcedureModel } from '@democracy-deutschland/bundestagio-common';

const search = (req, res) => {
  ProcedureModel.search(
    {
      function_score: {
        query: {
          multi_match: {
            query: req.query.s,
            fields: ['title^3', 'tags^2.5', 'abstract^2'],
            fuzziness: 'AUTO',
            prefix_length: 2,
          },
        },
      },
    },
    (err, result) => {
      if (err) {
        Log.error(inspect(err));
      }
      res.send(result);
    },
  );
};

module.exports = search;
