import mongoose from 'mongoose';

import NamedPollSchema from './2-schemas/NamedPoll';

module.exports.id = 'named-polls';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    // rename collection
    await this.db.collection('namedpolls').rename('old_namedpolls');

    // Since NamedPoll has an index the collection is autocreated
    mongoose.model('NamedPoll', NamedPollSchema);
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - this could cause dataloss
  done(new Error('Not supported rollback!'));
};
