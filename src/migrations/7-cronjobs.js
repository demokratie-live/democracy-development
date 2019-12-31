import mongoose from 'mongoose';

import CronJobSchema from './7-schemas/CronJob';

module.exports.id = 'cronjobs';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // rename collection
    await this.db.collection('cronjobs').rename('old_cronjobs');

    // Remove Model from Mongoose if needed
    if (mongoose.connection.models.CronJob) {
      delete mongoose.connection.models.CronJob;
    }

    // Load new models
    mongoose.model('CronJob', CronJobSchema);
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - since this will result in dataloss
  done(new Error('Not supported rollback!'));
};
