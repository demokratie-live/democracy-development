import { Schema } from 'mongoose';

const CronJobSchema = new Schema(
  {
    name: { type: String, unique: true, index: true, required: true },
    lastStartDate: { type: Date, default: null },
    lastErrorDate: { type: Date, default: null },
    lastError: { type: String, default: null },
    lastSuccessDate: { type: Date, default: null },
    lastSuccessStartDate: { type: Date, default: null },
    running: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default CronJobSchema;
