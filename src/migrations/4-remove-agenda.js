import mongoose from 'mongoose';

module.exports.id = 'remove-agenda';

module.exports.up = async function (done) { // eslint-disable-line
  // Why do we have to catch here - makes no sense!
  try {
    await mongoose.connection.db.dropCollection('agendas');
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.down = function (done) { // eslint-disable-line
  // We should not revert this - since this will not restore our data
  done(new Error('Not supported rollback!'));
};
