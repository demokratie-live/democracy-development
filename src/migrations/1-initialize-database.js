import mongoose from 'mongoose';

import DeputySchema from './1-schemas/Deputy';
import NamedPollSchema from './1-schemas/NamedPoll';
import ProcedureSchema from './1-schemas/Procedure';
import UserSchema from './1-schemas/User';

module.exports.id = 'initialize-database';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // Agendas have no index therefore we need to create the collection manually
    await this.db.createCollection('agendas');
    // CronJobs have no index therefore we need to create the collection manually
    await this.db.createCollection('cronjobs');

    // The following models do have indexes and the coresponding collection will be created
    const Deputies = mongoose.model('Deputy', DeputySchema);
    await Deputies.ensureIndexes();
    const NamedPolls = mongoose.model('NamedPoll', NamedPollSchema);
    await NamedPolls.ensureIndexes();
    const Procedures = mongoose.model('Procedure', ProcedureSchema);
    await Procedures.ensureIndexes();
    const Users = mongoose.model('User', UserSchema);
    await Users.ensureIndexes();
    const Histories = mongoose.model('History');
    await Histories.ensureIndexes();
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - this will cause dataloss
  done(new Error('Not supported rollback!'));
};
