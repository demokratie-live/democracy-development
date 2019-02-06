import mongoose from 'mongoose';
import { inspect } from 'util';
import ProcedureSchema from './../migrations/1-schemas/Procedure';

const Procedure = mongoose.model('Procedure', ProcedureSchema);

Procedure.createMapping({}, err => {
  if (err) {
    Log.error(`Procedure.createMapping ${inspect(err)}`);
    return err;
  }
  const stream = Procedure.synchronize();
  let count = 0;
  stream.on('data', () => {
    count += 1;
  });

  return new Promise((resolve, reject) => {
    stream.on('close', () => {
      Log.info(`indexed ${count} documents!`);
      resolve();
    });
    stream.on('error', err2 => {
      Log.error('ERROR Elastic: ', err2);
      reject();
    });
  });
});

export default Procedure;
