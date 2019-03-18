import mm from 'mongodb-migrations';
import config from './../../../mm-config';

export const create = name => {
  const migrator = new mm.Migrator(config);
  migrator.create(`${__dirname}/../`, name, err => {
    if (err) {
      Log.error(JSON.stringify(err));
    }
    migrator.dispose();
  });
};

export const migrate = async () =>
  new Promise((resolve, reject) => {
    const migrator = new mm.Migrator(config);
    migrator.runFromDir(`${__dirname}/../`, err => {
      if (err) {
        reject(err);
      }
      migrator.dispose();
      resolve();
    });
  });
