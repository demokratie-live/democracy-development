import mongoose from 'mongoose';
import NamedPollSchema from './../migrations/2-schemas/NamedPoll';

export default mongoose.model('NamedPoll', NamedPollSchema);
