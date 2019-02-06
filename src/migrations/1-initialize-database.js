import mongoose from 'mongoose';
import AgendaSchema from './1-schemas/Agenda';
import CronJobSchema from './1-schemas/CronJob';
import DeputySchema from './1-schemas/Deputy';
import NamedPollSchema from './1-schemas/NamedPoll';
import ProcedureSchema from './1-schemas/Procedure';
import UserSchema from './1-schemas/User';

module.exports.id = 'initialize-database';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // Agendas have no index therefore we need to create an Agenda to create the collection
    // We immediately delete it again
    const Agenda = mongoose.model('Agenda', AgendaSchema);
    (await new Agenda({}).save()).remove();
    // CronJobs have no index therefore we need to create an CronJob to create the collection
    // We immediately delete it again
    const CronJob = mongoose.model('CronJob', CronJobSchema);
    (await new CronJob({}).save()).remove();

    // The following models do have indexes and the coresponding collection will be created
    mongoose.model('Deputy', DeputySchema);
    mongoose.model('NamedPoll', NamedPollSchema);
    mongoose.model('Procedure', ProcedureSchema);
    mongoose.model('User', UserSchema);
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - this could cause dataloss
  done(new Error('Not supported rollback!'));
};
