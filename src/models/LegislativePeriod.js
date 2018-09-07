import mongoose, { Schema } from 'mongoose';

const LegislativePeriodSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true },
    start: { type: Date, required: true },
    end: Date,
    deputies: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model('LegislativePeriod', LegislativePeriodSchema);
