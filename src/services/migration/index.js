import { migrate } from './../../migrations/scripts';

export default async () => {
  await migrate().catch(err => {
    // Log the original error
    Log.error(err.stack);
    // throw own error
    throw new Error('Migration not successful - I die now!');
  });
};
