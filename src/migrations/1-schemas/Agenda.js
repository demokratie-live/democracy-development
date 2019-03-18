import { Schema } from 'mongoose';

const AgendaSchema = new Schema(
  {
    date: Date,
    week: Number,
    year: Number,
    meeting: Number,
    previousYear: Number,
    previousWeek: Number,
    nextYear: Number,
    nextWeek: Number,
  },
  { timestamps: true },
);

export default AgendaSchema;
