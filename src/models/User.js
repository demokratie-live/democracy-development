import mongoose from 'mongoose';
import UserSchema from './../migrations/1-schemas/User';

export default mongoose.model('User', UserSchema);
