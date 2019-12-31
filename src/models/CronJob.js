import mongoose from 'mongoose';
import CronJobSchema from './../migrations/7-schemas/CronJob';

export default mongoose.model('CronJob', CronJobSchema);
