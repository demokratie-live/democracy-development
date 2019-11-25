import mongoose from 'mongoose';

import ProcedureSchema from './6-schemas/Procedure';

module.exports.id = 'voteEnd';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // Remove Model from Mongoose if needed
    if (mongoose.connection.models.Procedure) {
      delete mongoose.connection.models.Procedure;
    }

    // Load new models
    mongoose.model('Procedure', ProcedureSchema);
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - since this will result in dataloss
  done(new Error('Not supported rollback!'));
};
