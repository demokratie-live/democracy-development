import mongoose from 'mongoose';
import CronJobSchema from './../migrations/1-schemas/CronJob';

export default mongoose.model('CronJob', CronJobSchema);
