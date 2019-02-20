import mongoose from 'mongoose';
import DeputySchema from './../migrations/1-schemas/Deputy';

export default mongoose.model('Deputy', DeputySchema);
