import mongoose from 'mongoose';

import ProcedureSchema from './5-schemas/Procedure';

module.exports.id = 'voteDate';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // Remove Model from Mongoose if needed
    if (mongoose.connection.models.Procedure) {
      delete mongoose.connection.models.Procedure;
    }

    // Cursor for raw data
    const procedures = this.db.collection('procedures');

    const proceduresCursor = procedures.find();
    // eslint-disable-next-line no-await-in-loop
    while (await proceduresCursor.hasNext()) {
      const procedure = await proceduresCursor.next(); // eslint-disable-line no-await-in-loop
      if (procedure.customData) {
        if (
          procedure.customData.expectedVotingDate ||
          procedure.customData.expectedVotingDate === null
        ) {
          procedure.voteDate = procedure.customData.expectedVotingDate;
          delete procedure.customData.expectedVotingDate;
        }
        if (
          procedure.customData.possibleVotingDate ||
          procedure.customData.possibleVotingDate === null
        ) {
          delete procedure.customData.possibleVotingDate;
        }
        await procedures.save(procedure); // eslint-disable-line no-await-in-loop
      }
    }

    // Load new models
    mongoose.model('Procedure', ProcedureSchema);
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - since this will not restore our data
  done(new Error('Not supported rollback!'));
};
