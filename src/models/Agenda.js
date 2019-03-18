import mongoose from 'mongoose';
import AgendaSchema from './../migrations/1-schemas/Agenda';

export default mongoose.model('Agenda', AgendaSchema);
