import mongoose from 'mongoose';
import ConferenceWeekDetailSchema from '../migrations/3-schemas/ConferenceWeekDetail';

export default mongoose.model('ConferenceWeekDetail', ConferenceWeekDetailSchema);
