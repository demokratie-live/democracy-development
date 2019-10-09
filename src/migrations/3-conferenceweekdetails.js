import mongoose from 'mongoose';

import ConferenceWeekDetailSchema from './3-schemas/ConferenceWeekDetail';

module.exports.id = 'ConferenceWeekDetails';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // The following models do have indexes and the coresponding collection will be created
    const ConferenceWeekDetails = mongoose.model(
      'ConferenceWeekDetail',
      ConferenceWeekDetailSchema,
    );
    await ConferenceWeekDetails.ensureIndexes();
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - this will cause dataloss
  done(new Error('Not supported rollback!'));
};
