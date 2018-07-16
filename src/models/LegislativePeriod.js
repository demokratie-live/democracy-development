import mongoose, { Schema } from "mongoose";

const LegislativePeriodSchema = new Schema(
  {
    legislativePeriod: { type: Number, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("LegislativePeriod", LegislativePeriodSchema);
